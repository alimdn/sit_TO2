import { NextRequest, NextResponse } from 'next/server'
import { fallbackTemplates } from '@/lib/fallback-data'

export async function GET() {
  let dbTemplates: any[] = []
  let useFallback = false

  try {
    const { db } = await import('@/lib/db')
    dbTemplates = await db.template.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    if (dbTemplates.length === 0) {
      useFallback = true
    }
  } catch (e) {
    useFallback = true
  }

  if (useFallback) {
    return NextResponse.json(fallbackTemplates)
  }

  // Merge fallback templates that have livePreview and aren't already in DB results
  const dbTitles = new Set(dbTemplates.map((t: any) => t.title))
  const missingFallback = fallbackTemplates.filter(
    (ft: any) => !dbTitles.has(ft.title) && (ft.livePreview || ft.previewUrl)
  )

  if (missingFallback.length > 0) {
    return NextResponse.json([...dbTemplates, ...missingFallback])
  }

  return NextResponse.json(dbTemplates)
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
