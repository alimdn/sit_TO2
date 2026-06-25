import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { fallbackTemplates } from '@/lib/fallback-data'
import {
  getAdminTemplates,
  getDeletedTemplateIds,
} from '@/lib/file-store'

/**
 * GET /api/templates/admin
 *
 * Returns ALL templates (active + inactive) for the admin panel.
 * This is distinct from GET /api/templates which only returns active
 * templates for the public website.
 *
 * Merge order (priority high → low):
 *   1. Admin overrides (Blob) — include BOTH active and inactive
 *   2. DB rows (when available)
 *   3. Fallback seed templates
 *
 * Excluded: soft-deleted templates (deletion marker in Blob).
 *
 * Admin-only.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // 1) Try DB first
  let dbTemplates: any[] = []
  let dbAvailable = false
  try {
    const { db } = await import('@/lib/db')
    dbTemplates = await db.template.findMany({ orderBy: { createdAt: 'desc' } })
    dbAvailable = true
  } catch (e) {
    console.error('[api/templates/admin] GET DB error:', e)
    // DB unavailable
  }

  // 2) Load admin overrides + deletion markers
  const [adminTemplates, deletedIds] = await Promise.all([
    getAdminTemplates(),
    getDeletedTemplateIds(),
  ])

  // 3) Merge: DB first (source of truth), then Blob overrides (only for
  //    templates NOT in the DB), then fallback seed templates.
  //    This ensures that when admin toggles active=false on a DB template,
  //    the Blob's stale active=true doesn't override it.
  const merged: any[] = []
  const seenIds = new Set<string>()
  const seenTitles = new Set<string>()

  // 3a. DB rows first — DB is the source of truth (includes BOTH active and inactive)
  for (const t of dbTemplates) {
    if (deletedIds.has(t.id)) continue
    merged.push(t)
    seenIds.add(t.id)
    seenTitles.add(t.title)
  }

  // 3b. Blob overrides — only for templates NOT already in the DB
  //     (These are legacy templates from before the DB was set up.)
  for (const t of adminTemplates) {
    if (deletedIds.has(t.id)) continue
    if (seenIds.has(t.id)) continue
    if (seenTitles.has(t.title)) continue
    merged.push(t)
    seenIds.add(t.id)
    seenTitles.add(t.title)
  }

  // 3c. Fallback seed templates (only if DB unavailable OR no DB rows)
  if (!dbAvailable || dbTemplates.length === 0) {
    for (const ft of fallbackTemplates) {
      if (deletedIds.has(ft.id)) continue
      if (seenIds.has(ft.id)) continue
      if (seenTitles.has(ft.title)) continue
      merged.push(ft)
      seenIds.add(ft.id)
      seenTitles.add(ft.title)
    }
  }

  // Sort: featured first, then by title
  merged.sort((a: any, b: any) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return (a.title || '').localeCompare(b.title || '')
  })

  return NextResponse.json(merged, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
