import { NextResponse } from 'next/server'

// GET a single testimonial by id (admin)
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { db } = await import('@/lib/db')
    const t = await db.testimonial.findUnique({ where: { id: params.id } })
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(t)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
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
      console.error('Testimonial PUT DB error:', dbErr)
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
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
    try {
      const { db } = await import('@/lib/db')
      await db.testimonial.delete({ where: { id: params.id } })
      return NextResponse.json({ ok: true })
    } catch (dbErr) {
      console.error('Testimonial DELETE DB error:', dbErr)
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
