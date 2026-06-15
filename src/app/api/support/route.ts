import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const userId = req.nextUrl.searchParams.get('userId')
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
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { userId, subject, category, message } = await req.json()
    const ticket = await db.supportTicket.create({
      data: { userId, subject, category, status: 'open', priority: 'medium' },
    })
    await db.message.create({ data: { ticketId: ticket.id, senderId: userId, content: message, isRead: true } })
    return NextResponse.json(ticket)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
