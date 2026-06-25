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

/**
 * PUT /api/settings — admin-only.
 *
 * We don't use db.siteSetting.upsert() here because the Supabase SiteSetting
 * table's `id` column has no default value — it's a plain TEXT NOT NULL.
 * The db adapter's create() does auto-generate an id, but if findUnique()
 * throws (e.g. transient network), the upsert path aborts before reaching
 * the create step. To be robust, we do a find-then-update-or-create manually
 * with explicit id generation.
 */
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

    // 1) Check if the setting already exists
    let existing: { id: string } | null = null
    try {
      const found = await db.siteSetting.findUnique({ where: { key } })
      existing = found as { id: string } | null
    } catch (e) {
      console.error('[api/settings] findUnique error:', e)
      // Continue to create path — the row may not exist
    }

    // 2a) Update existing
    if (existing?.id) {
      try {
        const updated = await db.siteSetting.update({
          where: { id: existing.id },
          data: { value },
        })
        return NextResponse.json(updated)
      } catch (e) {
        console.error('[api/settings] update error:', e)
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
      }
    }

    // 2b) Create new — explicitly generate id since Supabase has no default
    const newId = `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    try {
      const created = await db.siteSetting.create({
        data: { id: newId, key, value },
      })
      return NextResponse.json(created)
    } catch (e) {
      console.error('[api/settings] create error:', e)
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
    }
  } catch (e) {
    console.error('[api/settings] PUT outer error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
