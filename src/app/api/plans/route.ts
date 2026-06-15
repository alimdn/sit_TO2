import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const plans = await db.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  })
  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const plan = await db.subscriptionPlan.create({ data: body })
  return NextResponse.json(plan)
}
