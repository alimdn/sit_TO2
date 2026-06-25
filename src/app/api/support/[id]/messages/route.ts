import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = sessionUser.role === 'admin'
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const { content } = await req.json()
    // senderId comes from the session — never from the request body.
    const senderId = sessionUser.id

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    // Ownership check: only the ticket owner (or an admin) may post messages.
    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!isAdmin && ticket.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await db.message.create({ data: { ticketId: id, senderId, content: content.trim(), isRead: false } })
    await db.supportTicket.update({ where: { id }, data: { status: 'in_progress', updatedAt: new Date() } })
    return NextResponse.json(message)
  } catch (e) {
    console.error('[api/support/[id]/messages] POST error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
