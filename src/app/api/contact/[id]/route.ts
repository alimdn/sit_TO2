import { NextRequest, NextResponse } from 'next/server'

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const message = await db.contactMessage.update({ where: { id }, data: { isRead: true } })
    return NextResponse.json(message)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
