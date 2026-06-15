import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const link = await db.socialLink.update({ where: { id }, data: body })
  return NextResponse.json(link)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.socialLink.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
