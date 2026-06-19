import { NextRequest, NextResponse } from 'next/server'
import { fallbackPlans } from '@/lib/fallback-data'
import {
  getAdminPlans,
  getDeletedPlanIds,
  getPlanById,
  upsertPlan,
  markPlanDeleted,
  type StoredPlan,
} from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET a single plan by id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Check admin overrides (Blob) first
  const admin = await getPlanById(id)
  if (admin) return NextResponse.json(admin, { headers: NO_CACHE_HEADERS })

  // 2) Try DB
  try {
    const { db } = await import('@/lib/db')
    const plan = await db.subscriptionPlan.findUnique({ where: { id } })
    if (plan) return NextResponse.json(plan, { headers: NO_CACHE_HEADERS })
  } catch (e) {
    // fall through
  }

  // 3) Fallback seed
  const fallback = fallbackPlans.find(p => p.id === id)
  if (fallback) {
    const deleted = await getDeletedPlanIds()
    if (deleted.has(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS })
    }
    return NextResponse.json(fallback, { headers: NO_CACHE_HEADERS })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS })
}

// PUT — update a plan (create or replace an override)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const plan = await db.subscriptionPlan.update({ where: { id }, data: body })
    return NextResponse.json(plan)
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: write an override to the Blob store.
  // Merge with existing record so partial updates (e.g., just { active: false })
  // preserve all other fields.
  try {
    const now = new Date().toISOString()
    const existing = (await getPlanById(id))
      || fallbackPlans.find(p => p.id === id) as any

    const stored: StoredPlan = {
      id,
      name: String(body.name ?? existing?.name ?? '').slice(0, 120),
      price: body.price !== undefined ? Number(body.price) : (existing?.price ?? 0),
      currency: String(body.currency ?? existing?.currency ?? 'USD'),
      interval: String(body.interval ?? existing?.interval ?? 'monthly'),
      features: typeof body.features === 'string'
        ? body.features
        : (existing?.features
            ? existing.features
            : JSON.stringify(Array.isArray(body.features) ? body.features : [])),
      popular: body.popular !== undefined ? !!body.popular : (existing?.popular ?? false),
      active: body.active !== undefined ? !!body.active : (existing?.active ?? true),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }
    await upsertPlan(stored)
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Plan PUT error:', e)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

// DELETE — soft-delete a plan (writes a deletion marker)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    await db.subscriptionPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: write a deletion marker to the Blob store
  try {
    await markPlanDeleted(id)
    return NextResponse.json({ success: true, id, deleted: true })
  } catch (e) {
    console.error('Plan DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
