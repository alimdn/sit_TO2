import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [users, orders, subscriptions, payments, tickets, messages] = await Promise.all([
    db.user.count(),
    db.order.count(),
    db.subscription.count(),
    db.payment.findMany({ where: { status: 'completed' } }),
    db.supportTicket.count(),
    db.contactMessage.count(),
  ])

  const revenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return NextResponse.json({
    users,
    orders,
    subscriptions,
    revenue: Math.round(revenue),
    tickets,
    messages,
  })
}
