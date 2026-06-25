import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const link = await db.socialLink.update({ where: { id }, data: body })
    return NextResponse.json(link)
  } catch (e) {
    console.error('[api/social/[id]] PUT error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    await db.socialLink.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[api/social/[id]] DELETE error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
