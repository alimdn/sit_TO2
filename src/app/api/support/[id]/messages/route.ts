import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { senderId, content } = await req.json()
  const message = await db.message.create({
    data: {
      ticketId: id,
      senderId,
      content,
      isRead: false,
    },
  })
  // Update ticket status
  await db.supportTicket.update({
    where: { id },
    data: { status: 'in_progress', updatedAt: new Date() },
  })
  return NextResponse.json(message)
}
