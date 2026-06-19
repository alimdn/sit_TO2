import { NextResponse } from 'next/server'
import { deletePendingTestimonial, approvePendingTestimonial } from '@/lib/file-store'

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
  // File-store lookup (linear scan; pending list is small)
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
      // Fallback: file-store. Only support approve (active=true) and unapprove (active=false).
      if (typeof active === 'boolean') {
        const t = await approvePendingTestimonial(params.id)
        if (t) return NextResponse.json(t)
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
    // Fallback: file-store
    await deletePendingTestimonial(params.id)
    return NextResponse.json({ ok: true })
  }
}
