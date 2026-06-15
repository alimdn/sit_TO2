import { NextRequest, NextResponse } from 'next/server'
import { fallbackPlans } from '@/lib/fallback-data'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    const plan = await db.subscriptionPlan.findUnique({ where: { id } })
    if (plan) {
      return NextResponse.json(plan)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  const fallback = fallbackPlans.find(p => p.id === id)
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
    const plan = await db.subscriptionPlan.update({ where: { id }, data: body })
    return NextResponse.json(plan)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
