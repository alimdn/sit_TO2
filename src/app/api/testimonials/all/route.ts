import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { fallbackTestimonials } from '@/lib/fallback-data'
import { getAllPendingTestimonials } from '@/lib/file-store'

// Returns ALL testimonials (active + pending) for the admin panel.
// Merges DB rows + file-store pending rows + fallback defaults.
// Admin-only.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Start with file-store pending items (they appear first because newest at top)
  const pendingItems = await getAllPendingTestimonials()

  try {
    const { db } = await import('@/lib/db')
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })
    if (testimonials.length > 0) {
      // Merge DB rows with file-store rows (avoiding duplicate IDs)
      const fileIds = new Set(pendingItems.map(t => t.id))
      const merged = [...pendingItems, ...testimonials.filter(t => !fileIds.has(t.id))]
      return NextResponse.json(merged)
    }
  } catch (e) {
    console.error('[api/testimonials/all] GET DB error:', e)
    // fall through
  }

  // Fallback: pending file-store items + default seed testimonials (marked active)
  return NextResponse.json([
    ...pendingItems,
    ...fallbackTestimonials.map((t) => ({ ...t, active: true })),
  ])
}
