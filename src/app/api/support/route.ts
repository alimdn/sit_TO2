import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = sessionUser.role === 'admin'
  const requestedUserId = req.nextUrl.searchParams.get('userId')
  if (!isAdmin && requestedUserId && requestedUserId !== sessionUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const userId = isAdmin ? (requestedUserId || undefined) : sessionUser.id
  try {
    const { db } = await import('@/lib/db')
    if (userId) {
      const tickets = await db.supportTicket.findMany({
        where: { userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(tickets)
    }
    const tickets = await db.supportTicket.findMany({
      include: {
        user: { select: { name: true, email: true } },
        messages: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (e) {
    console.error('[api/support] GET error:', e)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const { subject, category, message } = body || {}
    // userId comes from the session — never from the request body.
    const userId = sessionUser.id

    // Validate inputs.
    if (typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
      return NextResponse.json({ error: 'Subject must be 3–200 characters' }, { status: 400 })
    }
    if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 10000) {
      return NextResponse.json({ error: 'Message must be 5–10000 characters' }, { status: 400 })
    }

    const ticket = await db.supportTicket.create({
      data: { userId, subject: subject.trim(), category: category ? String(category) : 'general', status: 'open', priority: 'medium' },
    })
    await db.message.create({ data: { ticketId: ticket.id, senderId: userId, content: message.trim(), isRead: true } })
    return NextResponse.json(ticket)
  } catch (e) {
    console.error('[api/support] POST error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
