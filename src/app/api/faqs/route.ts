import { NextResponse } from 'next/server'
import { fallbackFaqs } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const faqs = await db.fAQ.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    if (faqs.length > 0) {
      return NextResponse.json(faqs)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  return NextResponse.json(fallbackFaqs)
}
