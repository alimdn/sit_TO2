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
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { userId, planId } = await req.json()
    const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    const startDate = new Date()
    const endDate = new Date()
    if (plan.interval === 'monthly') endDate.setMonth(endDate.getMonth() + 1)
    else endDate.setFullYear(endDate.getFullYear() + 1)
    const sub = await db.subscription.create({
      data: { userId, planId, status: 'active', startDate, endDate, lastPayment: new Date() },
    })
    await db.payment.create({
      data: { subscriptionId: sub.id, amount: plan.price, currency: plan.currency, status: 'completed', method: 'card', transactionId: 'TXN-' + Date.now() },
    })
    await db.order.create({
      data: {
        userId, planId, status: 'pending', progress: 0,
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
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
