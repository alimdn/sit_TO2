import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const userId = req.nextUrl.searchParams.get('userId')
    if (userId) {
      const orders = await db.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(orders)
    }
    const orders = await db.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const order = await db.order.create({ data: body })
    return NextResponse.json(order)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
