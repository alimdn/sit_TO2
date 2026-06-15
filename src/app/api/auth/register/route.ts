import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({ data: { name, email, password: hashed, role: 'user' } })
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (e) {
    // Fallback for Vercel - return a mock user
    return NextResponse.json({
      user: { id: 'user-' + Date.now(), email, name, role: 'user' },
    })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { userId, name, phone, company } = await req.json()
    const user = await db.user.update({ where: { id: userId }, data: { name, phone, company } })
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone, company: user.company },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
