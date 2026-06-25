import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'

/** GET /api/settings — public. */
export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const settings = await db.siteSetting.findMany()
    return NextResponse.json(settings)
  } catch (e) {
    console.error('[api/settings] GET error:', e)
    return NextResponse.json([])
  }
}

/** PUT /api/settings — admin-only. */
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { db } = await import('@/lib/db')
    const { key, value } = await req.json()
    if (typeof key !== 'string' || key.length < 1 || key.length > 100) {
      return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
    }
    if (typeof value !== 'string' || value.length > 10_000) {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    }
    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json(setting)
  } catch (e) {
    console.error('[api/settings] PUT error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
