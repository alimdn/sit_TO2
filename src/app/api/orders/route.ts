import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, getOrdersByUser, createOrder } from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET — list orders. If ?userId is provided, filter by user.
// Admin (no userId) sees all orders.
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')

  // 1) Try DB first (when DATABASE_URL is configured)
  try {
    const { db } = await import('@/lib/db')
    if (userId) {
      const orders = await db.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      // Merge with Blob orders for this user (so admin/customer sees everything)
      const blobOrders = (await getOrdersByUser(userId)).map(o => ({
        ...o,
        user: o.customerName ? { name: o.customerName, email: o.customerEmail || '' } : null,
      }))
      const dbIds = new Set(orders.map((o: any) => o.id))
      const merged = [...orders, ...blobOrders.filter(o => !dbIds.has(o.id))]
      return NextResponse.json(merged, { headers: NO_CACHE_HEADERS })
    }
    const orders = await db.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    // Merge with all Blob orders
    const blobOrders = (await getAllOrders()).map(o => ({
      ...o,
      user: o.customerName ? { name: o.customerName, email: o.customerEmail || '' } : null,
    }))
    const dbIds = new Set(orders.map((o: any) => o.id))
    const merged = [...orders, ...blobOrders.filter(o => !dbIds.has(o.id))]
    // Sort newest first
    merged.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(merged, { headers: NO_CACHE_HEADERS })
  } catch (e) {
    // Fall through to Blob-only response
  }

  // 2) Fallback: Blob only
  const blobOrders = userId ? await getOrdersByUser(userId) : await getAllOrders()
  // Attach a synthetic `user` object for the admin UI
  const withUser = blobOrders.map(o => ({
    ...o,
    user: o.customerName ? { name: o.customerName, email: o.customerEmail || '' } : null,
  }))
  return NextResponse.json(withUser, { headers: NO_CACHE_HEADERS })
}

// POST — create a new order (from Checkout page or admin "Add Test Order")
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1) Try DB first
    try {
      const { db } = await import('@/lib/db')
      const order = await db.order.create({ data: body })
      return NextResponse.json(order)
    } catch (dbErr) {
      // Fall through to Blob fallback
    }

    // 2) Fallback: persist via Blob
    // Normalize the body into the StoredOrder shape
    const stored = await createOrder({
      userId: body.userId ? String(body.userId) : null,
      templateId: body.templateId ? String(body.templateId) : null,
      status: String(body.status || 'pending'),
      progress: Number(body.progress) || 0,
      milestones: String(body.milestones || JSON.stringify([
        { name: 'Order Placed', status: 'completed' },
        { name: 'Design Phase', status: 'pending' },
        { name: 'Review', status: 'pending' },
        { name: 'Development', status: 'pending' },
        { name: 'Delivery', status: 'pending' },
      ])),
      notes: body.notes ? String(body.notes) : null,
      templateFeatures: body.templateFeatures ? String(body.templateFeatures) : null,
      addOns: body.addOns ? String(body.addOns) : null,
      billing: body.billing ? String(body.billing) : null,
      additionalInfo: body.additionalInfo ? String(body.additionalInfo) : null,
      similarSiteUrl: body.similarSiteUrl ? String(body.similarSiteUrl) : null,
      similarSiteCriteria: body.similarSiteCriteria ? String(body.similarSiteCriteria) : null,
      domain: body.domain ? String(body.domain) : null,
      domainPrice: body.domainPrice !== undefined ? Number(body.domainPrice) : null,
      customerName: body.customerName ? String(body.customerName) : null,
      customerEmail: body.customerEmail ? String(body.customerEmail) : null,
    })
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Order POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
