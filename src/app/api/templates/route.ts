import { NextRequest, NextResponse } from 'next/server'
import { fallbackTemplates } from '@/lib/fallback-data'
import {
  getAdminTemplates,
  getDeletedTemplateIds,
  upsertTemplate,
  type StoredTemplate,
} from '@/lib/file-store'

// GET — public list of active templates shown on the website
export async function GET() {
  // 1) Try DB first (when DATABASE_URL is configured)
  let dbTemplates: any[] = []
  let useFallback = false
  try {
    const { db } = await import('@/lib/db')
    dbTemplates = await db.template.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    })
    if (dbTemplates.length === 0) {
      useFallback = true
    }
  } catch (e) {
    useFallback = true
  }

  // 2) Always also load admin overrides from Blob (these take priority)
  const [adminTemplates, deletedIds] = await Promise.all([
    getAdminTemplates(),
    getDeletedTemplateIds(),
  ])

  // 3) Merge: start with admin overrides (active only), then DB rows, then fallback
  const merged: any[] = []
  const seenIds = new Set<string>()
  const seenTitles = new Set<string>()

  // 3a. Admin overrides first (highest priority).
  // IMPORTANT: register the id in seenIds even when the override is inactive,
  // so the fallback seed version doesn't slip back into the public list.
  // (An admin who set active=false must see the template hidden publicly.)
  for (const t of adminTemplates) {
    if (deletedIds.has(t.id)) continue
    seenIds.add(t.id)
    seenTitles.add(t.title)
    if (!t.active) continue
    merged.push(t)
  }

  // 3b. DB rows (when available)
  for (const t of dbTemplates) {
    if (deletedIds.has(t.id)) continue
    if (seenIds.has(t.id)) continue
    if (seenTitles.has(t.title)) continue
    merged.push(t)
    seenIds.add(t.id)
    seenTitles.add(t.title)
  }

  // 3c. Fallback seed templates (only if not overridden/deleted)
  if (useFallback || dbTemplates.length === 0) {
    for (const ft of fallbackTemplates) {
      if (deletedIds.has(ft.id)) continue
      if (seenIds.has(ft.id)) continue
      if (seenTitles.has(ft.title)) continue
      merged.push(ft)
      seenIds.add(ft.id)
      seenTitles.add(ft.title)
    }
  }

  return NextResponse.json(merged)
}

// POST — admin creates a new template (or override of an existing one)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Try DB first
    try {
      const { db } = await import('@/lib/db')
      const template = await db.template.create({ data: body })
      return NextResponse.json(template)
    } catch (dbErr) {
      // Fall through to Blob fallback
    }

    // Fallback: persist via Blob append-only store
    const now = new Date().toISOString()
    // Generate an id if not provided
    const id = body.id || `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const stored: StoredTemplate = {
      id,
      title: String(body.title || '').slice(0, 200),
      description: String(body.description || '').slice(0, 5000),
      category: String(body.category || 'Business').slice(0, 100),
      image: String(body.image || '').slice(0, 1000),
      features: typeof body.features === 'string'
        ? body.features
        : JSON.stringify(Array.isArray(body.features) ? body.features : []),
      industries: typeof body.industries === 'string'
        ? body.industries
        : JSON.stringify(Array.isArray(body.industries) ? body.industries : []),
      featured: !!body.featured,
      active: body.active !== undefined ? !!body.active : true,
      previewUrl: body.previewUrl ? String(body.previewUrl) : null,
      livePreview: body.livePreview ? String(body.livePreview) : null,
      createdAt: now,
      updatedAt: now,
    }
    await upsertTemplate(stored)
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Template POST error:', e)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
