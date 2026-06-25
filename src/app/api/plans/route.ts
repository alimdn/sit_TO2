import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { fallbackPlans } from '@/lib/fallback-data'
import {
  getAdminPlans,
  getDeletedPlanIds,
  upsertPlan,
  type StoredPlan,
} from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET — public list of active plans shown on the website (Pricing page, Checkout, etc.)
export async function GET() {
  // 1) Try DB first (when DATABASE_URL is configured)
  let dbPlans: any[] = []
  let useFallback = false
  try {
    const { db } = await import('@/lib/db')
    dbPlans = await db.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    })
    if (dbPlans.length === 0) {
      useFallback = true
    }
  } catch (e) {
    useFallback = true
  }

  // 2) Always also load admin overrides from Blob (these take priority)
  const [adminPlans, deletedIds] = await Promise.all([
    getAdminPlans(),
    getDeletedPlanIds(),
  ])

  // 3) Merge: admin overrides (active only) → DB rows → fallback seed
  const merged: any[] = []
  const seenIds = new Set<string>()

  // 3a. Admin overrides first (highest priority).
  // Register the id in seenIds even when the override is inactive,
  // so the fallback seed version doesn't slip back into the public list.
  for (const p of adminPlans) {
    if (deletedIds.has(p.id)) continue
    seenIds.add(p.id)
    if (!p.active) continue
    merged.push(p)
  }

  // 3b. DB rows (when available)
  for (const p of dbPlans) {
    if (deletedIds.has(p.id)) continue
    if (seenIds.has(p.id)) continue
    merged.push(p)
    seenIds.add(p.id)
  }

  // 3c. Fallback seed plans (only if not overridden/deleted)
  if (useFallback || dbPlans.length === 0) {
    for (const fp of fallbackPlans) {
      if (deletedIds.has(fp.id)) continue
      if (seenIds.has(fp.id)) continue
      merged.push(fp)
      seenIds.add(fp.id)
    }
  }

  // Sort by price ascending
  merged.sort((a, b) => (a.price || 0) - (b.price || 0))

  return NextResponse.json(merged, { headers: NO_CACHE_HEADERS })
}

// POST — admin creates a new plan (or override of an existing one)
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    // Strip server-controlled fields.
    delete body.id
    delete body.createdAt

    // Try DB first
    try {
      const { db } = await import('@/lib/db')
      const plan = await db.subscriptionPlan.create({ data: body })
      return NextResponse.json(plan)
    } catch (dbErr) {
      console.error('[api/plans] POST DB error:', dbErr)
      // Fall through to Blob fallback
    }

    // Fallback: persist via Blob append-only store
    const now = new Date().toISOString()
    const id = body.id || `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const stored: StoredPlan = {
      id,
      name: String(body.name || '').slice(0, 120),
      price: Number(body.price) || 0,
      currency: String(body.currency || 'USD'),
      interval: String(body.interval || 'monthly'),
      features: typeof body.features === 'string'
        ? body.features
        : JSON.stringify(Array.isArray(body.features) ? body.features : []),
      popular: !!body.popular,
      active: body.active !== undefined ? !!body.active : true,
      createdAt: now,
      updatedAt: now,
    }
    await upsertPlan(stored)
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Plan POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
