/**
 * Edge middleware: security headers + per-IP rate limiting.
 * frame-ancestors 'self' allows same-origin template preview iframes.
 */
import { NextRequest, NextResponse } from 'next/server'

interface RateBucket { count: number; resetAt: number }

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth':            { limit: 10, windowMs: 60_000 },
  '/api/auth/register':   { limit: 5,  windowMs: 60_000 },
  '/api/orders':          { limit: 30, windowMs: 60_000 },
  '/api/subscriptions':   { limit: 20, windowMs: 60_000 },
  '/api/support':         { limit: 20, windowMs: 60_000 },
  '/api/contact':         { limit: 10, windowMs: 60_000 },
}

const buckets = new Map<string, RateBucket>()
let lastGc = Date.now()
function gcIfNeeded() {
  const now = Date.now()
  if (now - lastGc < 5 * 60_000) return
  lastGc = now
  for (const [key, b] of buckets) { if (b.resetAt < now) buckets.delete(key) }
}

function checkRateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  gcIfNeeded()
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  existing.count++
  if (existing.count > limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }
  return { ok: true }
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
}

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join('; ')

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Rate-limit sensitive endpoints
  for (const [route, cfg] of Object.entries(RATE_LIMITS)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const ip = getClientIp(req)
      const result = checkRateLimit(`${route}:${ip}`, cfg.limit, cfg.windowMs)
      if (!result.ok) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.', retryAfter: result.retryAfter },
          { status: 429, headers: { 'Retry-After': String(result.retryAfter), 'Cache-Control': 'no-store' } }
        )
      }
      break
    }
  }

  // 2) Apply security headers
  const res = NextResponse.next()
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v)
  }
  res.headers.set('Content-Security-Policy', CSP_HEADER)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)'],
}
