import { NextRequest, NextResponse } from 'next/server'
import { fallbackPlans } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const plans = await db.subscriptionPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    })
    if (plans.length > 0) {
      return NextResponse.json(plans)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  return NextResponse.json(fallbackPlans)
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const plan = await db.subscriptionPlan.create({ data: body })
    return NextResponse.json(plan)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
