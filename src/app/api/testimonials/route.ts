import { NextResponse } from 'next/server'
import { fallbackTestimonials } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const testimonials = await db.testimonial.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    if (testimonials.length > 0) {
      return NextResponse.json(testimonials)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  return NextResponse.json(fallbackTestimonials)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, role, company, content, rating } = body || {}

    // Basic validation
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

    // Try to persist to the database; if DB is unavailable (e.g. Vercel
    // serverless without DATABASE_URL), return a 503 so the client can inform
    // the user that submission is temporarily disabled.
    try {
      const { db } = await import('@/lib/db')
      const created = await db.testimonial.create({
        data: {
          name: name.trim().slice(0, 120),
          role: role.trim().slice(0, 120),
          company: company ? String(company).trim().slice(0, 120) : null,
          content: content.trim().slice(0, 2000),
          rating: Math.round(ratingNum),
          // New submissions start as inactive until an admin approves them
          active: false,
        },
      })
      return NextResponse.json({ ok: true, id: created.id, pending: true }, { status: 201 })
    } catch (dbErr) {
      console.error('Testimonial POST DB error:', dbErr)
      return NextResponse.json(
        { error: 'Review submission is temporarily unavailable. Please try again later.' },
        { status: 503 },
      )
    }
  } catch (e) {
    console.error('Testimonial POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
