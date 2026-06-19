import { NextResponse } from 'next/server'
import { fallbackTestimonials } from '@/lib/fallback-data'
import { getPendingTestimonials, addPendingTestimonial, getAllPendingTestimonials } from '@/lib/file-store'

export async function GET() {
  // 1) Try the database first
  try {
    const { db } = await import('@/lib/db')
    const testimonials = await db.testimonial.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    if (testimonials.length > 0) {
      // Also merge in approved file-store pending testimonials
      const fileItems = (await getAllPendingTestimonials()).filter(t => t.active)
      const dbIds = new Set(testimonials.map(t => t.id))
      const merged = [...testimonials, ...fileItems.filter(t => !dbIds.has(t.id))]
      return NextResponse.json(merged)
    }
  } catch (e) {
    // fall through
  }

  // 2) Merge approved file-store testimonials with fallback defaults
  const approvedFileItems = (await getAllPendingTestimonials()).filter(t => t.active)
  const merged = [...approvedFileItems, ...fallbackTestimonials]
  return NextResponse.json(merged)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, role, company, content, rating } = body || {}

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!role || typeof role !== 'string' || !role.trim()) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }
    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return NextResponse.json({ error: 'Review content must be at least 20 characters' }, { status: 400 })
    }
    const ratingNum = Number(rating)
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // 1) Try the database first
    try {
      const { db } = await import('@/lib/db')
      const created = await db.testimonial.create({
        data: {
          name: name.trim().slice(0, 120),
          role: role.trim().slice(0, 120),
          company: company ? String(company).trim().slice(0, 120) : null,
          content: content.trim().slice(0, 2000),
          rating: Math.round(ratingNum),
          active: false,
        },
      })
      return NextResponse.json({ ok: true, id: created.id, pending: true }, { status: 201 })
    } catch (dbErr) {
      // 2) Fallback: persist to file-store so admin can approve later
      const stored = await addPendingTestimonial({
        name: name.trim().slice(0, 120),
        role: role.trim().slice(0, 120),
        company: company ? String(company).trim().slice(0, 120) : null,
        content: content.trim().slice(0, 2000),
        rating: Math.round(ratingNum),
      })
      return NextResponse.json({ ok: true, id: stored.id, pending: true }, { status: 201 })
    }
  } catch (e) {
    console.error('Testimonial POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// Helper for admin endpoint to see pending reviews (used by /api/testimonials/all/route.ts)
export async function _getPendingList() {
  return getPendingTestimonials()
}
