import { NextResponse } from 'next/server'
import { fallbackTestimonials } from '@/lib/fallback-data'

// Returns ALL testimonials (active + pending) for the admin panel.
// The public GET (above) only returns active ones.
export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    if (testimonials.length > 0) {
      return NextResponse.json(testimonials)
    }
  } catch (e) {
    // fall through
  }
  // Mark fallback ones as active so the admin sees something
  return NextResponse.json(
    fallbackTestimonials.map((t) => ({ ...t, active: true })),
  )
}
