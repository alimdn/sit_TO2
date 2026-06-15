import { NextResponse } from 'next/server'
import { fallbackSocialLinks } from '@/lib/fallback-data'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const socialLinks = await db.socialLink.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    if (socialLinks.length > 0) {
      return NextResponse.json(socialLinks)
    }
  } catch (e) {
    // Database unavailable, use fallback
  }
  return NextResponse.json(fallbackSocialLinks)
}
