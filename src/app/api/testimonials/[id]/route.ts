import { NextResponse } from 'next/server'
import {
  deletePendingTestimonial,
  approvePendingTestimonial,
  unapprovePendingTestimonial,
  updatePendingTestimonial,
} from '@/lib/file-store'

// GET a single testimonial by id (admin)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { db } = await import('@/lib/db')
    const t = await db.testimonial.findUnique({ where: { id: params.id } })
    if (t) return NextResponse.json(t)
  } catch (e) {
    // fall through to file-store
  }
  const { getAllPendingTestimonials } = await import('@/lib/file-store')
  const all = await getAllPendingTestimonials()
  const found = all.find(t => t.id === params.id)
  if (found) return NextResponse.json(found)
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// PUT - update testimonial (e.g. approve/activate, edit content)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
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
        where: { id: params.id },
        data,
      })
      return NextResponse.json(updated)
    } catch (dbErr) {
      // Fallback: file-store. Handle approve / unapprove / general update.
      if (typeof active === 'boolean') {
        if (active) {
          await approvePendingTestimonial(params.id)
        } else {
          await unapprovePendingTestimonial(params.id)
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
        await updatePendingTestimonial(params.id, otherUpdates as any)
      }
      return NextResponse.json({ ok: true, id: params.id, ...data })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE - permanently remove a testimonial
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { db } = await import('@/lib/db')
    await db.testimonial.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    await deletePendingTestimonial(params.id)
    return NextResponse.json({ ok: true })
  }
}

