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
