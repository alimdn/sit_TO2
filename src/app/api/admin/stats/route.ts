import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'

/** GET /api/admin/stats — admin-only. */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { db } = await import('@/lib/db')
    const [users, orders, subscriptions, payments, tickets, messages] = await Promise.all([
      db.user.count(), db.order.count(), db.subscription.count(),
      db.payment.findMany({ where: { status: 'completed' } }),
      db.supportTicket.count(), db.contactMessage.count(),
    ])
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0)
    return NextResponse.json({
      users, orders, subscriptions,
      revenue: Math.round(revenue), tickets, messages,
    })
  } catch (e) {
    console.error('[api/admin/stats] error:', e)
    return NextResponse.json(
      { users: 0, orders: 0, subscriptions: 0, revenue: 0, tickets: 0, messages: 0 },
      { status: 503 }
    )
  }
}
