import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET a single order by id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const order = await db.order.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (order) return NextResponse.json(order, { headers: NO_CACHE_HEADERS })
  } catch (e) {
    // fall through
  }

  // 2) Fallback: Blob
  const order = await getOrderById(id)
  if (order) {
    return NextResponse.json(
      {
        ...order,
        user: order.customerName ? { name: order.customerName, email: order.customerEmail || '' } : null,
      },
      { headers: NO_CACHE_HEADERS }
    )
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS })
}

// PUT — update an order (status, progress, milestones, notes, etc.)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const order = await db.order.update({ where: { id }, data: body })
    return NextResponse.json(order)
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: update in Blob
  try {
    // Build a clean updates object from the request body
    const updates: Record<string, unknown> = {}
    const allowedFields = [
      'status', 'progress', 'milestones', 'notes',
      'templateFeatures', 'addOns', 'billing', 'additionalInfo',
      'similarSiteUrl', 'similarSiteCriteria', 'domain', 'domainPrice',
      'customerName', 'customerEmail', 'userId', 'templateId',
    ]
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }
    await updateOrder(id, updates)

    // Return the updated order
    const updated = await getOrderById(id)
    if (updated) {
      return NextResponse.json({
        ...updated,
        user: updated.customerName ? { name: updated.customerName, email: updated.customerEmail || '' } : null,
      })
    }
    return NextResponse.json({ ok: true, id })
  } catch (e) {
    console.error('Order PUT error:', e)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
