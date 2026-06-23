import { NextResponse } from 'next/server'
import { fallbackPlans } from '@/lib/fallback-data'
import {
  getAdminPlans,
  getDeletedPlanIds,
} from '@/lib/file-store'

/**
 * GET /api/plans/admin
 *
 * Returns ALL plans (active + inactive) for the admin panel.
 * Distinct from GET /api/plans which only returns active plans
 * for the public website.
 *
 * Merge order (priority high → low):
 *   1. Admin overrides (Blob) — include BOTH active and inactive
 *   2. DB rows (when available)
 *   3. Fallback seed plans
 *
 * Excluded: soft-deleted plans (deletion marker in Blob).
 */
export async function GET() {
  // 1) Try DB first
  let dbPlans: any[] = []
  let dbAvailable = false
  try {
    const { db } = await import('@/lib/db')
    dbPlans = await db.subscriptionPlan.findMany({ orderBy: { price: 'asc' } })
    dbAvailable = true
  } catch (e) {
    // DB unavailable
  }

  // 2) Load admin overrides + deletion markers
  const [adminPlans, deletedIds] = await Promise.all([
    getAdminPlans(),
    getDeletedPlanIds(),
  ])

  // 3) Merge
  const merged: any[] = []
  const seenIds = new Set<string>()

  // 3a. Admin overrides first (BOTH active and inactive)
  for (const p of adminPlans) {
    if (deletedIds.has(p.id)) continue
    merged.push(p)
    seenIds.add(p.id)
  }

  // 3b. DB rows (when available) — include inactive ones too
  for (const p of dbPlans) {
    if (deletedIds.has(p.id)) continue
    if (seenIds.has(p.id)) continue
    merged.push(p)
    seenIds.add(p.id)
  }

  // 3c. Fallback seed plans (only if DB unavailable OR no DB rows)
  if (!dbAvailable || dbPlans.length === 0) {
    for (const fp of fallbackPlans) {
      if (deletedIds.has(fp.id)) continue
      if (seenIds.has(fp.id)) continue
      merged.push(fp)
      seenIds.add(fp.id)
    }
  }

  // Sort by price ascending
  merged.sort((a, b) => (a.price || 0) - (b.price || 0))

  return NextResponse.json(merged, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
