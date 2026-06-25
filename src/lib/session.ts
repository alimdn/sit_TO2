/**
 * Session management using HTTP-only signed cookies.
 * HMAC-SHA256, 7-day TTL, Edge-runtime compatible (Web Crypto API).
 */
import { NextRequest } from 'next/server'

const COOKIE_NAME = 'wfs_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return 'webforge-fallback-prod-secret-' + (process.env.SUPABASE_URL || '')
    }
    return 'dev-only-insecure-secret-do-not-use-in-production'
  }
  return secret
}

async function importKey(): Promise<CryptoKey> {
  const secret = getSessionSecret()
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  )
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  avatar?: string | null
  phone?: string | null
  company?: string | null
}

interface SessionPayload {
  sub: string; email: string; name: string; role: 'admin' | 'user'
  avatar?: string | null; phone?: string | null; company?: string | null
  iat: number; exp: number
}

export async function createSessionCookie(user: SessionUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: user.id, email: user.email, name: user.name, role: user.role,
    avatar: user.avatar ?? null, phone: user.phone ?? null, company: user.company ?? null,
    iat: now, exp: now + SESSION_TTL_SECONDS,
  }
  const enc = new TextEncoder()
  const payloadB64 = toBase64Url(enc.encode(JSON.stringify(payload)))
  const key = await importKey()
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64)))
  return `${payloadB64}.${toBase64Url(sig)}`
}

export async function verifySessionCookie(cookieValue: string): Promise<SessionUser | null> {
  if (!cookieValue || typeof cookieValue !== 'string') return null
  const parts = cookieValue.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts

  let key: CryptoKey
  try { key = await importKey() } catch { return null }

  const enc = new TextEncoder()
  const sigBytes = fromBase64Url(sigB64)
  if (sigBytes.length === 0) return null
  const sigBuf = new Uint8Array(sigBytes)
  const ok = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(payloadB64))
  if (!ok) return null

  let payload: SessionPayload
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)))
  } catch { return null }

  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) return null

  return {
    id: payload.sub, email: payload.email, name: payload.name, role: payload.role,
    avatar: payload.avatar ?? null, phone: payload.phone ?? null, company: payload.company ?? null,
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME

export function buildSessionCookieHeader(value: string): string {
  const flags = [`${COOKIE_NAME}=${value}`, 'Path=/', `Max-Age=${SESSION_TTL_SECONDS}`, 'HttpOnly', 'SameSite=Lax']
  if (process.env.NODE_ENV === 'production') flags.push('Secure')
  return flags.join('; ')
}

export function buildClearSessionCookieHeader(): string {
  return [`${COOKIE_NAME}=`, 'Path=/', 'Max-Age=0', 'HttpOnly', 'SameSite=Lax'].join('; ')
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (!cookie) return null
  return verifySessionCookie(cookie)
}

export async function requireAdmin(req: NextRequest): Promise<SessionUser | null> {
  const user = await getSessionFromRequest(req)
  if (!user || user.role !== 'admin') return null
  return user
}
