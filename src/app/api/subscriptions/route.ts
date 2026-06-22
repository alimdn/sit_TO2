import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const userId = req.nextUrl.searchParams.get('userId')
    if (userId) {
      const subs = await db.subscription.findMany({
        where: { userId },
        include: { plan: true, payments: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(subs)
    }
    const subs = await db.subscription.findMany({
      include: { plan: true, user: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(subs)
  } catch (e) {
    console.error('[api/subscriptions] GET error:', e)
    return NextResponse.json([])
  }
}

/**
 * Compute the end date of a subscription based on the plan's interval.
 * Handles all 6 supported intervals:
 *   - monthly          → +1 month
 *   - semi_annual      → +6 months
 *   - annual           → +1 year
 *   - store            → +1 month (Store monthly)
 *   - store_semi_annual → +6 months
 *   - store_annual     → +1 year
 */
function computeEndDate(interval: string, startDate: Date): Date {
  const endDate = new Date(startDate)
  switch (interval) {
    case 'monthly':
    case 'store':
      endDate.setMonth(endDate.getMonth() + 1)
      break
    case 'semi_annual':
    case 'store_semi_annual':
      endDate.setMonth(endDate.getMonth() + 6)
      break
    case 'annual':
    case 'store_annual':
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
    default:
      // Fallback: 1 month
      endDate.setMonth(endDate.getMonth() + 1)
  }
  return endDate
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()

    // Accept either:
    //   { userId, planId: '<cuid>' }           — lookup by DB id
    //   { userId, planId: 'monthly' | 'store' | 'store_semi_annual' | ... } — lookup by interval
    // The PlansPage sends interval strings ('monthly', 'semi_annual', 'annual',
    // 'store', 'store_semi_annual', 'store_annual'), so we look up by interval first.
    const { userId, planId } = body
    if (!userId || !planId) {
      return NextResponse.json({ error: 'userId and planId are required' }, { status: 400 })
    }

    let plan
    // Try lookup by interval first (PlansPage sends interval strings).
    // findMany with take:1 is the adapter's equivalent of findFirst.
    const plans = await db.subscriptionPlan.findMany({
      where: { interval: planId, active: true },
      take: 1,
    })
    plan = plans[0]
    // Fallback to lookup by id (cuid)
    if (!plan) {
      try {
        plan = await db.subscriptionPlan.findUnique({ where: { id: planId } })
      } catch {
        // not a valid cuid — ignore
      }
    }
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const startDate = new Date()
    const endDate = computeEndDate(plan.interval, startDate)

    const sub = await db.subscription.create({
      data: { userId, planId: plan.id, status: 'active', startDate, endDate, lastPayment: new Date() },
    })
    await db.payment.create({
      data: { subscriptionId: sub.id, amount: plan.price, currency: plan.currency, status: 'completed', method: 'card', transactionId: 'TXN-' + Date.now() },
    })
    await db.order.create({
      data: {
        userId, planId: plan.id, status: 'pending', progress: 0,
        milestones: JSON.stringify([
          { name: 'Briefing', status: 'pending', date: null },
          { name: 'Design', status: 'pending', date: null },
          { name: 'Development', status: 'pending', date: null },
          { name: 'Launch', status: 'pending', date: null },
        ]),
      },
    })
    return NextResponse.json(sub)
  } catch (e) {
    console.error('[api/subscriptions] POST error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
