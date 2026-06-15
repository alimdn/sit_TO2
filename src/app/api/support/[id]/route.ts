import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: { messages: { include: { sender: { select: { name: true } } }, orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ticket)
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const ticket = await db.supportTicket.update({ where: { id }, data: body })
    return NextResponse.json(ticket)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
