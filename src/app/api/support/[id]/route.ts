import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        include: { sender: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const ticket = await db.supportTicket.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(ticket)
}
