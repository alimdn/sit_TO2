import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const { senderId, content } = await req.json()
    const message = await db.message.create({ data: { ticketId: id, senderId, content, isRead: false } })
    await db.supportTicket.update({ where: { id }, data: { status: 'in_progress', updatedAt: new Date() } })
    return NextResponse.json(message)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
