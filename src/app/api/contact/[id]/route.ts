import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const message = await db.contactMessage.update({
    where: { id },
    data: { isRead: true },
  })
  return NextResponse.json(message)
}
