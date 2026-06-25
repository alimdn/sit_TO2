import { NextRequest, NextResponse } from 'next/server'
import {
  createSessionCookie,
  buildSessionCookieHeader,
  buildClearSessionCookieHeader,
  getSessionFromRequest,
  type SessionUser,
} from '@/lib/session'

/**
 * POST /api/auth — login. Issues a signed HTTP-only session cookie.
 * NO hardcoded fallback — all logins must validate against the DB.
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 1024) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')
    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const sessionUser: SessionUser = {
      id: user.id, email: user.email, name: user.name,
      role: user.role as 'admin' | 'user',
      avatar: user.avatar ?? null, phone: user.phone ?? null, company: user.company ?? null,
    }
    const cookieValue = await createSessionCookie(sessionUser)
    const response = NextResponse.json({ user: sessionUser })
    response.headers.set('Set-Cookie', buildSessionCookieHeader(cookieValue))
    return response
  } catch (e) {
    console.error('[api/auth] POST error:', e)
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 })
  }
}

/**
 * PUT /api/auth — change password. Reads userId from session.
 */
export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 1024) {
    return NextResponse.json({ error: 'New password must be 8-1024 characters' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')
    const user = await db.user.findUnique({ where: { id: sessionUser.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({ where: { id: user.id }, data: { password: hashed } })

    const newSessionUser: SessionUser = {
      id: user.id, email: user.email, name: user.name,
      role: user.role as 'admin' | 'user',
      avatar: user.avatar ?? null, phone: user.phone ?? null, company: user.company ?? null,
    }
    const cookieValue = await createSessionCookie(newSessionUser)
    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', buildSessionCookieHeader(cookieValue))
    return response
  } catch (e) {
    console.error('[api/auth] PUT error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}

/** DELETE /api/auth — logout. Clears the session cookie. */
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', buildClearSessionCookieHeader())
  return response
}

/** GET /api/auth — returns the current session user (or 401). */
export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  return NextResponse.json({ user })
}
