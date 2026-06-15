import { NextRequest, NextResponse } from 'next/server'
import { fallbackTemplates } from '@/lib/fallback-data'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    const template = await db.template.findUnique({ where: { id } })
    if (template) {
      return NextResponse.json(template)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  // Try fallback
  const fallback = fallbackTemplates.find(t => t.id === id)
  if (fallback) {
    return NextResponse.json(fallback)
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const template = await db.template.update({ where: { id }, data: body })
    return NextResponse.json(template)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { db } = await import('@/lib/db')
    await db.template.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
