import { NextRequest, NextResponse } from 'next/server'
import { fallbackTemplates } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const templates = await db.template.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    if (templates.length > 0) {
      return NextResponse.json(templates)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  return NextResponse.json(fallbackTemplates)
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const template = await db.template.create({ data: body })
    return NextResponse.json(template)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
