/**
 * Append-only storage for messages and reviews using Vercel Blob.
 *
 * DESIGN
 * ──────
 * Each message is stored as its OWN blob with a unique pathname like:
 *   messages/msg-<timestamp>-<random>.json
 *
 * The GET endpoint uses the `list()` API to enumerate every blob in
 * the `messages/` prefix, fetches each one in parallel, and merges them.
 *
 * WHY THIS DESIGN
 * ───────────────
 * The previous "single blob + read-modify-write" approach had two bugs:
 *
 *  1. Race condition: two concurrent POSTs both read the current list,
 *     both append their new message, both overwrite the same blob. The
 *     second write wins, deleting the first message.
 *
 *  2. Read-during-write flicker: GET reads the blob mid-overwrite and
 *     occasionally catches an empty or partial file, causing the admin
 *     panel to briefly show zero messages.
 *
 * Append-only eliminates both: writes never touch each other, and a
 * GET always sees the full set of previously-written blobs.
 *
 * The local /tmp file fallback keeps the same append-only pattern so
 * dev mode behaves identically.
 */

import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = '/tmp/wfs-data'
const MSG_DIR = path.join(DATA_DIR, 'messages')
const REV_DIR = path.join(DATA_DIR, 'reviews')

export interface StoredContactMessage {
  id: string
  name: string
  email: string
  subject: string
  category: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface StoredTestimonial {
  id: string
  name: string
  role: string
  company: string | null
  content: string
  rating: number
  active: boolean
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────
// Detect whether Vercel Blob is configured
// ─────────────────────────────────────────────────────────────────────
function isBlobConfigured(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN)
}

async function blobHead() {
  try {
    return await import('@vercel/blob')
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────
// Local filesystem helpers (append-only)
// ─────────────────────────────────────────────────────────────────────
async function localWriteMessage(id: string, data: StoredContactMessage): Promise<void> {
  try {
    await fs.mkdir(MSG_DIR, { recursive: true })
    await fs.writeFile(path.join(MSG_DIR, `${id}.json`), JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('local message write failed:', e)
  }
}

async function localListMessages(): Promise<StoredContactMessage[]> {
  try {
    await fs.mkdir(MSG_DIR, { recursive: true })
    const files = await fs.readdir(MSG_DIR)
    const items: StoredContactMessage[] = []
    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(MSG_DIR, f), 'utf-8')
        items.push(JSON.parse(raw))
      } catch {
        // skip corrupt file
      }
    }
    return items
  } catch {
    return []
  }
}

async function localDeleteMessage(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(MSG_DIR, `${id}.json`))
  } catch {
    // ignore
  }
}

async function localUpdateMessage(id: string, updates: Partial<StoredContactMessage>): Promise<void> {
  try {
    const file = path.join(MSG_DIR, `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const data: StoredContactMessage = JSON.parse(raw)
    const updated = { ...data, ...updates }
    await fs.writeFile(file, JSON.stringify(updated, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

// Same pattern for reviews
async function localWriteReview(id: string, data: StoredTestimonial): Promise<void> {
  try {
    await fs.mkdir(REV_DIR, { recursive: true })
    await fs.writeFile(path.join(REV_DIR, `${id}.json`), JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('local review write failed:', e)
  }
}

async function localListReviews(): Promise<StoredTestimonial[]> {
  try {
    await fs.mkdir(REV_DIR, { recursive: true })
    const files = await fs.readdir(REV_DIR)
    const items: StoredTestimonial[] = []
    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(REV_DIR, f), 'utf-8')
        items.push(JSON.parse(raw))
      } catch {
        // skip
      }
    }
    return items
  } catch {
    return []
  }
}

async function localDeleteReview(id: string): Promise<void> {
  try {
    await fs.unlink(path.join(REV_DIR, `${id}.json`))
  } catch {
    // ignore
  }
}

async function localUpdateReview(id: string, updates: Partial<StoredTestimonial>): Promise<void> {
  try {
    const file = path.join(REV_DIR, `${id}.json`)
    const raw = await fs.readFile(file, 'utf-8')
    const data: StoredTestimonial = JSON.parse(raw)
    const updated = { ...data, ...updates }
    await fs.writeFile(file, JSON.stringify(updated, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────
// Vercel Blob helpers (append-only)
// ─────────────────────────────────────────────────────────────────────
async function blobWriteMessage(data: StoredContactMessage): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(`messages/${data.id}.json`, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch (e) {
    console.error('blob message write failed:', e)
  }
}

async function blobListMessages(): Promise<StoredContactMessage[]> {
  const blob = await blobHead()
  if (!blob) return []
  try {
    const list = await blob.list({ prefix: 'messages/' })
    const items: StoredContactMessage[] = []
    // Fetch each blob in parallel
    const fetches = list.blobs.map(async (b: { url: string }) => {
      try {
        const res = await fetch(b.url, { cache: 'no-store' })
        if (!res.ok) return
        const text = await res.text()
        items.push(JSON.parse(text))
      } catch {
        // skip
      }
    })
    await Promise.all(fetches)
    return items
  } catch (e) {
    console.error('blob message list failed:', e)
    return []
  }
}

async function blobDeleteMessage(id: string): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    const list = await blob.list({ prefix: `messages/${id}.json` })
    for (const b of list.blobs) {
      await blob.del(b.url)
    }
  } catch (e) {
    console.error('blob message delete failed:', e)
  }
}

async function blobUpdateMessage(id: string, updates: Partial<StoredContactMessage>): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    const list = await blob.list({ prefix: `messages/${id}.json` })
    if (list.blobs.length === 0) return
    const res = await fetch(list.blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return
    const data: StoredContactMessage = await res.json()
    const updated = { ...data, ...updates }
    await blob.put(`messages/${id}.json`, JSON.stringify(updated, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch (e) {
    console.error('blob message update failed:', e)
  }
}

// Same pattern for reviews
async function blobWriteReview(data: StoredTestimonial): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(`reviews/${data.id}.json`, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch (e) {
    console.error('blob review write failed:', e)
  }
}

async function blobListReviews(): Promise<StoredTestimonial[]> {
  const blob = await blobHead()
  if (!blob) return []
  try {
    const list = await blob.list({ prefix: 'reviews/' })
    const items: StoredTestimonial[] = []
    const fetches = list.blobs.map(async (b: { url: string }) => {
      try {
        const res = await fetch(b.url, { cache: 'no-store' })
        if (!res.ok) return
        const text = await res.text()
        items.push(JSON.parse(text))
      } catch {
        // skip
      }
    })
    await Promise.all(fetches)
    return items
  } catch (e) {
    console.error('blob review list failed:', e)
    return []
  }
}

async function blobDeleteReview(id: string): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    const list = await blob.list({ prefix: `reviews/${id}.json` })
    for (const b of list.blobs) {
      await blob.del(b.url)
    }
  } catch (e) {
    console.error('blob review delete failed:', e)
  }
}

async function blobUpdateReview(id: string, updates: Partial<StoredTestimonial>): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    const list = await blob.list({ prefix: `reviews/${id}.json` })
    if (list.blobs.length === 0) return
    const res = await fetch(list.blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return
    const data: StoredTestimonial = await res.json()
    const updated = { ...data, ...updates }
    await blob.put(`reviews/${id}.json`, JSON.stringify(updated, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch (e) {
    console.error('blob review update failed:', e)
  }
}

// ─────────────────────────────────────────────────────────────────────
// Unified public API (uses Blob when configured, else local fs)
// ─────────────────────────────────────────────────────────────────────

export async function getContactMessages(): Promise<StoredContactMessage[]> {
  let items: StoredContactMessage[] = []
  if (isBlobConfigured()) {
    items = await blobListMessages()
  }
  // Always also check local fs (helps in dev/preview and as a safety net)
  const localItems = await localListMessages()
  // Merge, dedupe by id
  const seen = new Set(items.map(i => i.id))
  for (const li of localItems) {
    if (!seen.has(li.id)) {
      items.push(li)
      seen.add(li.id)
    }
  }
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return items
}

export async function addContactMessage(
  data: Omit<StoredContactMessage, 'id' | 'isRead' | 'createdAt'>
): Promise<StoredContactMessage> {
  const newMessage: StoredContactMessage = {
    ...data,
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  // Write to BOTH blob (primary, shared) and local fs (fast read on same instance)
  if (isBlobConfigured()) {
    await blobWriteMessage(newMessage)
  }
  await localWriteMessage(newMessage.id, newMessage)
  return newMessage
}

export async function markContactMessageRead(id: string): Promise<void> {
  const updates = { isRead: true }
  if (isBlobConfigured()) await blobUpdateMessage(id, updates)
  await localUpdateMessage(id, updates)
}

export async function markContactMessageUnread(id: string): Promise<void> {
  const updates = { isRead: false }
  if (isBlobConfigured()) await blobUpdateMessage(id, updates)
  await localUpdateMessage(id, updates)
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (isBlobConfigured()) await blobDeleteMessage(id)
  await localDeleteMessage(id)
}

// ─────────────────────────────────────────────────────────────────────
// Pending testimonials (same append-only pattern)
// ─────────────────────────────────────────────────────────────────────

export async function getPendingTestimonials(): Promise<StoredTestimonial[]> {
  let items: StoredTestimonial[] = []
  if (isBlobConfigured()) {
    items = await blobListReviews()
  }
  const localItems = await localListReviews()
  const seen = new Set(items.map(i => i.id))
  for (const li of localItems) {
    if (!seen.has(li.id)) {
      items.push(li)
      seen.add(li.id)
    }
  }
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return items
}

export async function addPendingTestimonial(
  data: Omit<StoredTestimonial, 'id' | 'active' | 'createdAt'>
): Promise<StoredTestimonial> {
  const newItem: StoredTestimonial = {
    ...data,
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    active: false,
    createdAt: new Date().toISOString(),
  }
  if (isBlobConfigured()) await blobWriteReview(newItem)
  await localWriteReview(newItem.id, newItem)
  return newItem
}

export async function getAllPendingTestimonials(): Promise<StoredTestimonial[]> {
  return getPendingTestimonials()
}

export async function deletePendingTestimonial(id: string): Promise<void> {
  if (isBlobConfigured()) await blobDeleteReview(id)
  await localDeleteReview(id)
}

export async function approvePendingTestimonial(id: string): Promise<StoredTestimonial | null> {
  const updates = { active: true }
  if (isBlobConfigured()) await blobUpdateReview(id, updates)
  await localUpdateReview(id, updates)
  // Return the updated item
  const all = await getPendingTestimonials()
  return all.find(t => t.id === id) || null
}

export async function unapprovePendingTestimonial(id: string): Promise<StoredTestimonial | null> {
  const updates = { active: false }
  if (isBlobConfigured()) await blobUpdateReview(id, updates)
  await localUpdateReview(id, updates)
  const all = await getPendingTestimonials()
  return all.find(t => t.id === id) || null
}

export async function updatePendingTestimonial(
  id: string,
  updates: Partial<StoredTestimonial>
): Promise<void> {
  if (isBlobConfigured()) await blobUpdateReview(id, updates)
  await localUpdateReview(id, updates)
}

// ═════════════════════════════════════════════════════════════════════
// TEMPLATES — append-only override store
// ═════════════════════════════════════════════════════════════════════
// Templates have a base set in fallback-data.ts (read-only seed). The
// admin can CREATE new templates, EDIT existing ones (creating an
// override), or DELETE any template. We track three operations:
//
//   templates/<id>.json        → upserted template (create or edit)
//   templates-deleted/<id>.json→ marker file meaning "this id is deleted"
//
// GET /api/templates merges: fallback ∪ overrides − deleted.
// This way admins can fully manage templates without a database.

export interface StoredTemplate {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string        // JSON string of string[]
  industries: string      // JSON string of string[]
  featured: boolean
  active: boolean
  previewUrl?: string | null
  livePreview?: string | null
  createdAt: string
  updatedAt?: string
}

const TPL_DIR = path.join(DATA_DIR, 'templates')
const TPL_DELETED_DIR = path.join(DATA_DIR, 'templates-deleted')

// ─── Local fs helpers ──────────────────────────────────────────────────
async function localWriteTemplate(t: StoredTemplate): Promise<void> {
  try {
    await fs.mkdir(TPL_DIR, { recursive: true })
    await fs.writeFile(path.join(TPL_DIR, `${t.id}.json`), JSON.stringify(t, null, 2), 'utf-8')
    // Remove any stale deletion marker (the template is alive again)
    await fs.unlink(path.join(TPL_DELETED_DIR, `${t.id}.json`)).catch(() => {})
  } catch (e) {
    console.error('local template write failed:', e)
  }
}

async function localListTemplates(): Promise<StoredTemplate[]> {
  try {
    await fs.mkdir(TPL_DIR, { recursive: true })
    const files = await fs.readdir(TPL_DIR)
    const items: StoredTemplate[] = []
    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(TPL_DIR, f), 'utf-8')
        items.push(JSON.parse(raw))
      } catch {
        // skip corrupt file
      }
    }
    return items
  } catch {
    return []
  }
}

async function localListDeletedTemplateIds(): Promise<Set<string>> {
  try {
    await fs.mkdir(TPL_DELETED_DIR, { recursive: true })
    const files = await fs.readdir(TPL_DELETED_DIR)
    const ids = new Set<string>()
    for (const f of files) {
      if (f.endsWith('.json')) ids.add(f.replace(/\.json$/, ''))
    }
    return ids
  } catch {
    return new Set()
  }
}

async function localMarkTemplateDeleted(id: string): Promise<void> {
  try {
    await fs.mkdir(TPL_DELETED_DIR, { recursive: true })
    await fs.writeFile(
      path.join(TPL_DELETED_DIR, `${id}.json`),
      JSON.stringify({ id, deletedAt: new Date().toISOString() }),
      'utf-8'
    )
    // Remove the override blob if it exists
    await fs.unlink(path.join(TPL_DIR, `${id}.json`)).catch(() => {})
  } catch (e) {
    console.error('local template delete failed:', e)
  }
}

// ─── Blob helpers ──────────────────────────────────────────────────────
async function blobWriteTemplate(t: StoredTemplate): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(`templates/${t.id}.json`, JSON.stringify(t, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
    // Remove deletion marker if present
    try {
      const list = await blob.list({ prefix: `templates-deleted/${t.id}.json` })
      for (const b of list.blobs) await blob.del(b.url)
    } catch {}
  } catch (e) {
    console.error('blob template write failed:', e)
  }
}

async function blobListTemplates(): Promise<StoredTemplate[]> {
  const blob = await blobHead()
  if (!blob) return []
  try {
    const list = await blob.list({ prefix: 'templates/' })
    const items: StoredTemplate[] = []
    const fetches = list.blobs.map(async (b: { url: string; pathname?: string }) => {
      try {
        // Skip deletion markers (they live under 'templates-deleted/' which
        // also matches the 'templates/' prefix — filter them out explicitly)
        if (b.pathname && b.pathname.includes('templates-deleted/')) return
        const res = await fetch(b.url, { cache: 'no-store' })
        if (!res.ok) return
        const text = await res.text()
        const parsed = JSON.parse(text) as StoredTemplate
        // Skip if this is a deletion marker disguised as a template
        if ((parsed as any).deletedAt) return
        items.push(parsed)
      } catch {
        // skip
      }
    })
    await Promise.all(fetches)

    // Deduplicate by id — if multiple blobs exist for the same id (e.g.
    // from older writes before allowOverwrite was set), keep the one with
    // the most recent updatedAt.
    const byId = new Map<string, StoredTemplate>()
    for (const t of items) {
      const existing = byId.get(t.id)
      if (!existing) {
        byId.set(t.id, t)
      } else {
        const a = new Date(t.updatedAt || t.createdAt || 0).getTime()
        const b = new Date(existing.updatedAt || existing.createdAt || 0).getTime()
        if (a > b) byId.set(t.id, t)
      }
    }
    return Array.from(byId.values())
  } catch (e) {
    console.error('blob template list failed:', e)
    return []
  }
}

async function blobListDeletedTemplateIds(): Promise<Set<string>> {
  const blob = await blobHead()
  if (!blob) return new Set()
  try {
    const list = await blob.list({ prefix: 'templates-deleted/' })
    const ids = new Set<string>()
    for (const b of list.blobs) {
      // Extract id from pathname. Format: 'templates-deleted/<id>.json'
      // The id may contain hyphens, so we match everything between the last
      // '/' and '.json'.
      const pn = b.pathname || ''
      const filename = pn.split('/').pop() || ''
      const id = filename.replace(/\.json$/, '')
      if (id) ids.add(id)
    }
    return ids
  } catch {
    return new Set()
  }
}

async function blobMarkTemplateDeleted(id: string): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(
      `templates-deleted/${id}.json`,
      JSON.stringify({ id, deletedAt: new Date().toISOString() }, null, 2),
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
      }
    )
    // Remove override blob if present
    try {
      const list = await blob.list({ prefix: `templates/${id}.json` })
      for (const b of list.blobs) await blob.del(b.url)
    } catch {}
  } catch (e) {
    console.error('blob template delete failed:', e)
  }
}

// ─── Unified public API ────────────────────────────────────────────────

/**
 * Returns ALL admin-managed templates (overrides + new templates),
 * NOT including the fallback seed. The API layer merges these with
 * fallback-data, applying deletion markers.
 */
export async function getAdminTemplates(): Promise<StoredTemplate[]> {
  let items: StoredTemplate[] = []
  if (isBlobConfigured()) {
    items = await blobListTemplates()
  }
  const localItems = await localListTemplates()
  const seen = new Set(items.map(i => i.id))
  for (const li of localItems) {
    if (!seen.has(li.id)) {
      items.push(li)
      seen.add(li.id)
    }
  }
  return items
}

export async function getDeletedTemplateIds(): Promise<Set<string>> {
  let ids = new Set<string>()
  if (isBlobConfigured()) {
    ids = await blobListDeletedTemplateIds()
  }
  const localIds = await localListDeletedTemplateIds()
  for (const id of localIds) ids.add(id)
  return ids
}

export async function upsertTemplate(t: StoredTemplate): Promise<StoredTemplate> {
  if (isBlobConfigured()) await blobWriteTemplate(t)
  await localWriteTemplate(t)
  return t
}

export async function markTemplateDeleted(id: string): Promise<void> {
  if (isBlobConfigured()) await blobMarkTemplateDeleted(id)
  await localMarkTemplateDeleted(id)
}

export async function getTemplateById(id: string): Promise<StoredTemplate | null> {
  const all = await getAdminTemplates()
  return all.find(t => t.id === id) || null
}

// ═════════════════════════════════════════════════════════════════════
// PLANS — append-only override store (same pattern as templates)
// ═════════════════════════════════════════════════════════════════════
// Base plans live in fallback-data.ts (read-only seed). Admin can
// CREATE new plans, EDIT existing ones (creating an override), or
// DELETE any plan. We track:
//   plans/<id>.json        → upserted plan (create or edit)
//   plans-deleted/<id>.json→ marker file meaning "this id is deleted"

export interface StoredPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: string        // 'monthly' | 'semi_annual' | 'annual'
  features: string        // JSON string of string[]
  popular: boolean
  active: boolean
  createdAt: string
  updatedAt?: string
}

const PLAN_DIR = path.join(DATA_DIR, 'plans')
const PLAN_DELETED_DIR = path.join(DATA_DIR, 'plans-deleted')

// ─── Local fs helpers ──────────────────────────────────────────────────
async function localWritePlan(p: StoredPlan): Promise<void> {
  try {
    await fs.mkdir(PLAN_DIR, { recursive: true })
    await fs.writeFile(path.join(PLAN_DIR, `${p.id}.json`), JSON.stringify(p, null, 2), 'utf-8')
    await fs.unlink(path.join(PLAN_DELETED_DIR, `${p.id}.json`)).catch(() => {})
  } catch (e) {
    console.error('local plan write failed:', e)
  }
}

async function localListPlans(): Promise<StoredPlan[]> {
  try {
    await fs.mkdir(PLAN_DIR, { recursive: true })
    const files = await fs.readdir(PLAN_DIR)
    const items: StoredPlan[] = []
    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(PLAN_DIR, f), 'utf-8')
        items.push(JSON.parse(raw))
      } catch { /* skip */ }
    }
    return items
  } catch {
    return []
  }
}

async function localListDeletedPlanIds(): Promise<Set<string>> {
  try {
    await fs.mkdir(PLAN_DELETED_DIR, { recursive: true })
    const files = await fs.readdir(PLAN_DELETED_DIR)
    const ids = new Set<string>()
    for (const f of files) {
      if (f.endsWith('.json')) ids.add(f.replace(/\.json$/, ''))
    }
    return ids
  } catch {
    return new Set()
  }
}

async function localMarkPlanDeleted(id: string): Promise<void> {
  try {
    await fs.mkdir(PLAN_DELETED_DIR, { recursive: true })
    await fs.writeFile(
      path.join(PLAN_DELETED_DIR, `${id}.json`),
      JSON.stringify({ id, deletedAt: new Date().toISOString() }),
      'utf-8'
    )
    await fs.unlink(path.join(PLAN_DIR, `${id}.json`)).catch(() => {})
  } catch (e) {
    console.error('local plan delete failed:', e)
  }
}

// ─── Blob helpers ──────────────────────────────────────────────────────
async function blobWritePlan(p: StoredPlan): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(`plans/${p.id}.json`, JSON.stringify(p, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
    try {
      const list = await blob.list({ prefix: `plans-deleted/${p.id}.json` })
      for (const b of list.blobs) await blob.del(b.url)
    } catch {}
  } catch (e) {
    console.error('blob plan write failed:', e)
  }
}

async function blobListPlans(): Promise<StoredPlan[]> {
  const blob = await blobHead()
  if (!blob) return []
  try {
    const list = await blob.list({ prefix: 'plans/' })
    const items: StoredPlan[] = []
    const fetches = list.blobs.map(async (b: { url: string; pathname?: string }) => {
      try {
        if (b.pathname && b.pathname.includes('plans-deleted/')) return
        const res = await fetch(b.url, { cache: 'no-store' })
        if (!res.ok) return
        const text = await res.text()
        const parsed = JSON.parse(text) as StoredPlan
        if ((parsed as any).deletedAt) return
        items.push(parsed)
      } catch { /* skip */ }
    })
    await Promise.all(fetches)

    // Dedupe by id — keep the most recent updatedAt
    const byId = new Map<string, StoredPlan>()
    for (const p of items) {
      const existing = byId.get(p.id)
      if (!existing) {
        byId.set(p.id, p)
      } else {
        const a = new Date(p.updatedAt || p.createdAt || 0).getTime()
        const b = new Date(existing.updatedAt || existing.createdAt || 0).getTime()
        if (a > b) byId.set(p.id, p)
      }
    }
    return Array.from(byId.values())
  } catch (e) {
    console.error('blob plan list failed:', e)
    return []
  }
}

async function blobListDeletedPlanIds(): Promise<Set<string>> {
  const blob = await blobHead()
  if (!blob) return new Set()
  try {
    const list = await blob.list({ prefix: 'plans-deleted/' })
    const ids = new Set<string>()
    for (const b of list.blobs) {
      const pn = b.pathname || ''
      const filename = pn.split('/').pop() || ''
      const id = filename.replace(/\.json$/, '')
      if (id) ids.add(id)
    }
    return ids
  } catch {
    return new Set()
  }
}

async function blobMarkPlanDeleted(id: string): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    await blob.put(
      `plans-deleted/${id}.json`,
      JSON.stringify({ id, deletedAt: new Date().toISOString() }, null, 2),
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
      }
    )
    try {
      const list = await blob.list({ prefix: `plans/${id}.json` })
      for (const b of list.blobs) await blob.del(b.url)
    } catch {}
  } catch (e) {
    console.error('blob plan delete failed:', e)
  }
}

// ─── Unified public API ────────────────────────────────────────────────

export async function getAdminPlans(): Promise<StoredPlan[]> {
  let items: StoredPlan[] = []
  if (isBlobConfigured()) {
    items = await blobListPlans()
  }
  const localItems = await localListPlans()
  const seen = new Set(items.map(i => i.id))
  for (const li of localItems) {
    if (!seen.has(li.id)) {
      items.push(li)
      seen.add(li.id)
    }
  }
  return items
}

export async function getDeletedPlanIds(): Promise<Set<string>> {
  let ids = new Set<string>()
  if (isBlobConfigured()) {
    ids = await blobListDeletedPlanIds()
  }
  const localIds = await localListDeletedPlanIds()
  for (const id of localIds) ids.add(id)
  return ids
}

export async function upsertPlan(p: StoredPlan): Promise<StoredPlan> {
  if (isBlobConfigured()) await blobWritePlan(p)
  await localWritePlan(p)
  return p
}

export async function markPlanDeleted(id: string): Promise<void> {
  if (isBlobConfigured()) await blobMarkPlanDeleted(id)
  await localMarkPlanDeleted(id)
}

export async function getPlanById(id: string): Promise<StoredPlan | null> {
  const all = await getAdminPlans()
  return all.find(p => p.id === id) || null
}
