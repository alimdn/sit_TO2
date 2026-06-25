import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/session'
import { getAllOrders, getOrdersByUser, createOrder } from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET — list orders. If ?userId is provided, filter by user.
// Admin (no userId) sees all orders.
export async function GET(req: NextRequest) {
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS })
  }
  const isAdmin = sessionUser.role === 'admin'
  const requestedUserId = req.nextUrl.searchParams.get('userId')
  if (!isAdmin && requestedUserId && requestedUserId !== sessionUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: NO_CACHE_HEADERS })
  }
  const userId = isAdmin ? (requestedUserId || undefined) : sessionUser.id

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
    console.error('[api/orders] GET DB error:', e)
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
  const sessionUser = await getSessionFromRequest(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = sessionUser.role === 'admin'
  try {
    const body = await req.json()

    // Resolve userId: regular users always use their own session id.
    // Admins may override via body.userId (including null for test orders).
    const effectiveUserId = isAdmin
      ? (body.userId !== undefined ? body.userId : sessionUser.id)
      : sessionUser.id

    // Parse milestones from body, or use default 7-stage lifecycle
    const DEFAULT_MILESTONES = [
      { name: 'Order Confirmed',           status: 'completed', date: new Date().toISOString() },
      { name: 'Design Phase',              status: 'pending' },
      { name: 'Customer Review',           status: 'pending' },
      { name: 'Development & Integration', status: 'pending' },
      { name: 'Testing & QA',              status: 'pending' },
      { name: 'Final Preview',             status: 'pending' },
      { name: 'Deployment & Delivery',     status: 'pending' },
    ]
    // Custom progress mapping: stage 6 (Final Preview) stays at 83%
    const MILESTONE_PROGRESS = [17, 33, 50, 67, 83, 83, 100]
    let milestones: any[] = DEFAULT_MILESTONES
    if (body.milestones) {
      try {
        const parsed = typeof body.milestones === 'string'
          ? JSON.parse(body.milestones)
          : body.milestones
        if (Array.isArray(parsed) && parsed.length > 0) {
          milestones = parsed
        }
      } catch { /* use default */ }
    }

    // AUTO-CALCULATE progress from milestones using the custom mapping.
    // Finds the last completed milestone and looks up its target percentage.
    // Stage 6 (Final Preview) keeps progress at 83% — it's a checkpoint.
    let lastCompletedIdx = -1
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (milestones[i].status === 'completed') {
        lastCompletedIdx = i
        break
      }
    }
    let autoProgress = 0
    if (lastCompletedIdx >= 0) {
      // Use custom mapping if the milestones match the default 7 stages
      if (lastCompletedIdx < MILESTONE_PROGRESS.length && milestones.length === MILESTONE_PROGRESS.length) {
        autoProgress = MILESTONE_PROGRESS[lastCompletedIdx]
      } else {
        // Fallback: linear calculation for custom milestone counts
        const completedCount = milestones.filter((m: any) => m.status === 'completed').length
        autoProgress = Math.round((completedCount / milestones.length) * 100)
      }
    }

    // Use the auto-calculated progress, OR the client-provided value if it's
    // higher (in case the admin manually sets a higher progress). The
    // auto-calculated value takes priority to keep milestones & progress
    // in sync.
    const finalProgress = autoProgress

    // Auto-determine status from progress:
    // 100% → 'completed', >0% → 'in_progress', 0% → 'pending'
    let finalStatus = String(body.status || 'pending')
    if (finalProgress === 100) {
      finalStatus = 'completed'
    } else if (finalProgress > 0 && finalStatus === 'pending') {
      finalStatus = 'in_progress'
    }

    const milestonesJson = JSON.stringify(milestones)

    // 1) Try DB first
    try {
      const { db } = await import('@/lib/db')
      const { id: _id, createdAt: _createdAt, ...restBody } = body
      const order = await db.order.create({
        data: { ...restBody, userId: effectiveUserId ?? null, milestones: milestonesJson, progress: finalProgress, status: finalStatus }
      })
      return NextResponse.json(order)
    } catch (dbErr) {
      console.error('[api/orders] POST DB error:', dbErr)
      // Fall through to Blob fallback
    }

    // 2) Fallback: persist via Blob
    const stored = await createOrder({
      userId: effectiveUserId ? String(effectiveUserId) : null,
      templateId: body.templateId ? String(body.templateId) : null,
      status: finalStatus,
      progress: finalProgress,
      milestones: milestonesJson,
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
      startDate: body.startDate ? String(body.startDate) : null,
      deliveryDate: body.deliveryDate ? String(body.deliveryDate) : null,
      isDemo: body.isDemo === true,
    })
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Order POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
