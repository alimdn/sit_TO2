import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = sessionUser.role === 'admin'
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: { messages: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!isAdmin && ticket.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(ticket)
  } catch (e) {
    console.error('[api/support/[id]] GET error:', e)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = sessionUser.role === 'admin'
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const body = await req.json()

    // First fetch the ticket to verify ownership for non-admins.
    const ticket = await db.supportTicket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!isAdmin && ticket.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build the update payload based on role.
    const update: Record<string, unknown> = {}
    if (isAdmin) {
      // Admins may update status and priority (plus other safe fields).
      if (body.status !== undefined) update.status = String(body.status)
      if (body.priority !== undefined) update.priority = String(body.priority)
      if (body.subject !== undefined) update.subject = String(body.subject).slice(0, 200)
      if (body.category !== undefined) update.category = String(body.category)
    } else {
      // Regular users can only close their own tickets.
      if (body.status === 'closed') {
        update.status = 'closed'
      } else {
        return NextResponse.json({ error: 'Only admins may update status or priority' }, { status: 403 })
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(ticket)
    }

    const updated = await db.supportTicket.update({ where: { id }, data: update })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[api/support/[id]] PUT error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
