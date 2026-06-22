import { NextRequest, NextResponse } from 'next/server'
import { fallbackTemplates } from '@/lib/fallback-data'
import {
  getAdminTemplates,
  getDeletedTemplateIds,
  getTemplateById,
  upsertTemplate,
  markTemplateDeleted,
  type StoredTemplate,
} from '@/lib/file-store'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
}

// GET a single template by id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Check admin overrides (Blob) first
  const admin = await getTemplateById(id)
  if (admin) return NextResponse.json(admin, { headers: NO_CACHE_HEADERS })

  // 2) Try DB
  try {
    const { db } = await import('@/lib/db')
    const template = await db.template.findUnique({ where: { id } })
    if (template) return NextResponse.json(template, { headers: NO_CACHE_HEADERS })
  } catch (e) {
    // fall through
  }

  // 3) Fallback seed
  const fallback = fallbackTemplates.find(t => t.id === id)
  if (fallback) {
    // Don't return if it was deleted by admin
    const deleted = await getDeletedTemplateIds()
    if (deleted.has(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS })
    }
    return NextResponse.json(fallback, { headers: NO_CACHE_HEADERS })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE_HEADERS })
}

// PUT — update a template (create or replace an override)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const template = await db.template.update({ where: { id }, data: body })
    // Only return if the DB actually had this template (template is non-null).
    // If template is null, the ID doesn't exist in the DB — fall through to
    // the Blob fallback so legacy templates (from before DB was set up) can
    // still be updated.
    if (template) {
      return NextResponse.json(template)
    }
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: write an override to the Blob store.
  //    If the template exists in fallback-data or as an admin override,
  //    we keep its id and merge the new fields. Otherwise we create new.
  try {
    const now = new Date().toISOString()
    // Look for existing record (admin override first, then fallback seed)
    const existing = (await getTemplateById(id))
      || fallbackTemplates.find(t => t.id === id) as any

    const stored: StoredTemplate = {
      id,
      title: String(body.title ?? existing?.title ?? '').slice(0, 200),
      description: String(body.description ?? existing?.description ?? '').slice(0, 5000),
      category: String(body.category ?? existing?.category ?? 'Business').slice(0, 100),
      image: String(body.image ?? existing?.image ?? '').slice(0, 1000),
      features: typeof body.features === 'string'
        ? body.features
        : (existing?.features
            ? existing.features
            : JSON.stringify(Array.isArray(body.features) ? body.features : [])),
      industries: typeof body.industries === 'string'
        ? body.industries
        : (existing?.industries
            ? existing.industries
            : JSON.stringify(Array.isArray(body.industries) ? body.industries : [])),
      featured: body.featured !== undefined ? !!body.featured : (existing?.featured ?? false),
      active: body.active !== undefined ? !!body.active : (existing?.active ?? true),
      previewUrl: body.previewUrl !== undefined
        ? (body.previewUrl ? String(body.previewUrl) : null)
        : (existing?.previewUrl ?? null),
      livePreview: body.livePreview !== undefined
        ? (body.livePreview ? String(body.livePreview) : null)
        : (existing?.livePreview ?? null),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }
    await upsertTemplate(stored)
    return NextResponse.json(stored)
  } catch (e) {
    console.error('Template PUT error:', e)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE — soft-delete a template (writes a deletion marker)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1) Try DB first
  try {
    const { db } = await import('@/lib/db')
    const deleted = await db.template.delete({ where: { id } })
    // If the DB had this template, we're done.
    // Also write a deletion marker to the Blob store so that any stale Blob
    // override doesn't reappear in the merged list.
    if (deleted) {
      try { await markTemplateDeleted(id) } catch {}
      return NextResponse.json({ success: true })
    }
  } catch (e) {
    // Fall through to Blob fallback
  }

  // 2) Fallback: write a deletion marker to the Blob store
  try {
    await markTemplateDeleted(id)
    return NextResponse.json({ success: true, id, deleted: true })
  } catch (e) {
    console.error('Template DELETE error:', e)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
