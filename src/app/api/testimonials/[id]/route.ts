import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import {
  deletePendingTestimonial,
  approvePendingTestimonial,
  unapprovePendingTestimonial,
  updatePendingTestimonial,
  getAllPendingTestimonials,
} from '@/lib/file-store'

// GET a single testimonial by id (admin-only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    const t = await db.testimonial.findUnique({ where: { id } })
    if (t) return NextResponse.json(t)
  } catch (e) {
    console.error('[api/testimonials/[id]] GET DB error:', e)
    // fall through to file-store
  }
  const all = await getAllPendingTestimonials()
  const found = all.find(t => t.id === id)
  if (found) return NextResponse.json(found)
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// PUT - update testimonial (e.g. approve/activate, edit content) — admin-only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const { name, role, company, content, rating, active } = body || {}

    const data: Record<string, unknown> = {}
    if (typeof name === 'string') data.name = name.trim().slice(0, 120)
    if (typeof role === 'string') data.role = role.trim().slice(0, 120)
    if (typeof company === 'string') data.company = company.trim().slice(0, 120) || null
    if (typeof content === 'string') data.content = content.trim().slice(0, 2000)
    if (rating !== undefined) {
      const r = Number(rating)
      if (Number.isFinite(r) && r >= 1 && r <= 5) data.rating = Math.round(r)
    }
    if (typeof active === 'boolean') data.active = active

    try {
      const { db } = await import('@/lib/db')
      const updated = await db.testimonial.update({
        where: { id },
        data,
      })
      return NextResponse.json(updated)
    } catch (dbErr) {
      console.error('[api/testimonials/[id]] PUT DB error:', dbErr)
      // Fallback: file-store. Handle approve / unapprove / general update.
      if (typeof active === 'boolean') {
        if (active) {
          await approvePendingTestimonial(id)
        } else {
          await unapprovePendingTestimonial(id)
        }
      }
      // Apply other edits (name/role/company/content/rating) if provided
      const otherUpdates: Partial<Record<string, unknown>> = {}
      if (data.name) otherUpdates.name = data.name
      if (data.role) otherUpdates.role = data.role
      if (data.company !== undefined) otherUpdates.company = data.company
      if (data.content) otherUpdates.content = data.content
      if (data.rating !== undefined) otherUpdates.rating = data.rating
      if (Object.keys(otherUpdates).length > 0) {
        await updatePendingTestimonial(id, otherUpdates as any)
      }
      return NextResponse.json({ ok: true, id, ...data })
    }
  } catch (e) {
    console.error('[api/testimonials/[id]] PUT error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE - permanently remove a testimonial — admin-only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    await db.testimonial.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/testimonials/[id]] DELETE DB error:', e)
    await deletePendingTestimonial(id)
    return NextResponse.json({ ok: true })
  }
}
