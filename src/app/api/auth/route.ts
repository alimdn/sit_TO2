import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
      },
    })
  } catch (e) {
    // Fallback: demo login for Vercel
    if (email === 'demo@webflowsub.com' && password === 'demo123') {
      return NextResponse.json({
        user: {
          id: 'demo-user',
          email: 'demo@webflowsub.com',
          name: 'Demo User',
          role: 'user',
          avatar: null,
          phone: '+1 (555) 123-4567',
          company: 'Acme Inc.',
        },
      })
    }
    if (email === 'admin@webflowsub.com' && password === 'admin123') {
      return NextResponse.json({
        user: {
          id: 'admin-user',
          email: 'admin@webflowsub.com',
          name: 'Admin User',
          role: 'admin',
          avatar: null,
          phone: null,
          company: null,
        },
      })
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const bcrypt = await import('bcryptjs')
    const { userId, currentPassword, newPassword } = await req.json()
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    const hashed = await bcrypt.hash(newPassword, 10)
    await db.user.update({ where: { id: userId }, data: { password: hashed } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
