import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, requireAdmin } from '@/lib/session'
import { getOrderById, updateOrder, deleteOrder } from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET a single order by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
  }
  const isAdmin = sessionUser.role === 'admin'
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const order = await db.order.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (order) {
      if (!isAdmin && order.userId !== sessionUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: NO_CACHE_HEADERS })
      }
      return NextResponse.json(order, { headers: NO_CACHE_HEADERS })
    }
  } catch (e) {
    console.error('[api/orders/[id]] GET DB error:', e)
    // fall through
  }

  // 2) Fallback: Blob
  const order = await getOrderById(id)
  if (order) {
    // Blob orders may not have a userId (test/guest orders). If they do,
    // enforce ownership for non-admins.
    if (!isAdmin && order.userId && order.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: NO_CACHE_HEADERS })
    }
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
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const body = await req.json()

  // Strip server-controlled fields.
  delete body.id
  delete body.userId

  // AUTO-CALCULATE progress from milestones if milestones are being updated.
  // Uses the custom 7-stage progress mapping where stage 6 (Final Preview)
  // stays at 83% — it's a checkpoint, not a progress increase.
  if (body.milestones) {
    try {
      const milestones = typeof body.milestones === 'string'
        ? JSON.parse(body.milestones)
        : body.milestones
      if (Array.isArray(milestones) && milestones.length > 0) {
        // Custom progress mapping for the 7-stage lifecycle
        const MILESTONE_PROGRESS = [17, 33, 50, 67, 83, 83, 100]

        // Find the last completed milestone
        let lastCompletedIdx = -1
        for (let i = milestones.length - 1; i >= 0; i--) {
          if (milestones[i].status === 'completed') {
            lastCompletedIdx = i
            break
          }
        }

        let autoProgress = 0
        if (lastCompletedIdx >= 0) {
          if (lastCompletedIdx < MILESTONE_PROGRESS.length && milestones.length === MILESTONE_PROGRESS.length) {
            autoProgress = MILESTONE_PROGRESS[lastCompletedIdx]
          } else {
            // Fallback: linear calculation for custom milestone counts
            const completedCount = milestones.filter((m: any) => m.status === 'completed').length
            autoProgress = Math.round((completedCount / milestones.length) * 100)
          }
        }

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
    console.error('[api/orders/[id]] PUT DB error:', e)
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
      'startDate', 'deliveryDate', 'isDemo',
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    await db.order.delete({ where: { id } })
    return NextResponse.json({ success: true, id, deleted: true })
  } catch (e) {
    console.error('[api/orders/[id]] DELETE DB error:', e)
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
