import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder, deleteOrder } from '@/lib/file-store'

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

  // AUTO-CALCULATE progress from milestones if milestones are being updated.
  // This ensures progress ALWAYS matches the milestone state, even if the
  // client sends a different progress value.
  if (body.milestones) {
    try {
      const milestones = typeof body.milestones === 'string'
        ? JSON.parse(body.milestones)
        : body.milestones
      if (Array.isArray(milestones) && milestones.length > 0) {
        const completedCount = milestones.filter((m: any) => m.status === 'completed').length
        const autoProgress = Math.round((completedCount / milestones.length) * 100)
        // Override the progress with the auto-calculated value
        body.progress = autoProgress
        // Also auto-set status based on progress
        if (autoProgress === 100) {
          body.status = 'completed'
        } else if (autoProgress > 0 && (!body.status || body.status === 'pending')) {
          body.status = 'in_progress'
        }
      }
    } catch { /* milestones not valid JSON — ignore */ }
  }

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
      'startDate', 'deliveryDate',
    ]
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field]
    }
    const updated = await updateOrder(id, updates)
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

// DELETE — permanently remove an order.
// Used by the admin to clean up test/problematic orders.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    await db.order.delete({ where: { id } })
    return NextResponse.json({ success: true, id, deleted: true })
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: delete from Blob + local fs
  try {
    await deleteOrder(id)
    return NextResponse.json({ success: true, id, deleted: true })
  } catch (e) {
    console.error('Order DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
