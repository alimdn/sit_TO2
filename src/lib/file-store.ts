/**
 * Hybrid storage for messages and reviews.
 *
 * PRIMARY: Vercel Blob (shared across all serverless instances)
 *   — needs BLOB_READ_WRITE_TOKEN + BLOB_URL env vars (auto-created
 *     when a Blob store is linked to the project in Vercel).
 *   — Durable, survives cold starts and deployments.
 *
 * FALLBACK: Local /tmp file system (per-instance, ephemeral)
 *   — Used when Blob env vars are not set.
 *   — Lets the code run in dev / preview without configuration.
 *
 * When DATABASE_URL is set on Vercel, the API routes prefer Prisma
 * and skip this module entirely.
 */

import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = '/tmp/wfs-data'
const MESSAGES_FILE = path.join(DATA_DIR, 'contact-messages.json')
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials-pending.json')

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
  return !!(process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_URL)
}

// Dynamic import of @vercel/blob (avoids import errors in dev when missing)
async function blobHead() {
  try {
    return await import('@vercel/blob')
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────
// Generic JSON read/write helpers
// ─────────────────────────────────────────────────────────────────────

async function localRead<T>(file: string, fallback: T): Promise<T> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function localWrite<T>(file: string, data: T): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('local write failed:', e)
  }
}

async function blobRead<T>(pathname: string, fallback: T): Promise<T> {
  const blob = await blobHead()
  if (!blob) return fallback
  try {
    // Vercel Blob: try to GET the file. head() doesn't return contents;
    // we use a fetch against the public URL instead.
    const url = `${process.env.BLOB_URL}/${pathname}.json`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      // @ts-ignore — cache option is valid for fetch on Vercel
      cache: 'no-store',
    })
    if (!res.ok) return fallback
    const text = await res.text()
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

async function blobWrite<T>(pathname: string, data: T): Promise<void> {
  const blob = await blobHead()
  if (!blob) return
  try {
    // Use put() with a JSON string body and returnJSON access strategy
    await blob.put(`${pathname}.json`, JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } catch (e) {
    console.error('blob write failed:', e)
  }
}

// Unified read/write that picks Blob when configured, else local fs
async function readJson<T>(pathname: string, localFile: string, fallback: T): Promise<T> {
  if (isBlobConfigured()) {
    const blobData = await blobRead<T>(pathname, fallback as T)
    if (blobData && (!Array.isArray(blobData) || blobData.length > 0)) {
      return blobData
    }
    // Fall back to local if Blob returned empty (e.g., first run)
    return localRead<T>(localFile, fallback)
  }
  return localRead<T>(localFile, fallback)
}

async function writeJson<T>(pathname: string, localFile: string, data: T): Promise<void> {
  if (isBlobConfigured()) {
    await blobWrite<T>(pathname, data)
  }
  // Always also write locally so reads are fast on the same instance
  await localWrite<T>(localFile, data)
}

// ─────────────────────────────────────────────────────────────────────
// Contact messages
// ─────────────────────────────────────────────────────────────────────

export async function getContactMessages(): Promise<StoredContactMessage[]> {
  const messages = await readJson<StoredContactMessage[]>('contact-messages', MESSAGES_FILE, [])
  if (!Array.isArray(messages)) return []
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return messages
}

export async function addContactMessage(
  data: Omit<StoredContactMessage, 'id' | 'isRead' | 'createdAt'>
): Promise<StoredContactMessage> {
  const messages = await getContactMessages()
  const newMessage: StoredContactMessage = {
    ...data,
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    isRead: false,
    createdAt: new Date().toISOString(),
  }
  // Prepend and write back
  const updated = [newMessage, ...messages]
  await writeJson('contact-messages', MESSAGES_FILE, updated)
  return newMessage
}

export async function markContactMessageRead(id: string): Promise<void> {
  const messages = await getContactMessages()
  const idx = messages.findIndex(m => m.id === id)
  if (idx >= 0) {
    messages[idx].isRead = true
    await writeJson('contact-messages', MESSAGES_FILE, messages)
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const messages = await getContactMessages()
  await writeJson('contact-messages', MESSAGES_FILE, messages.filter(m => m.id !== id))
}

// ─────────────────────────────────────────────────────────────────────
// Pending testimonials
// ─────────────────────────────────────────────────────────────────────

export async function getPendingTestimonials(): Promise<StoredTestimonial[]> {
  const items = await readJson<StoredTestimonial[]>('testimonials-pending', TESTIMONIALS_FILE, [])
  if (!Array.isArray(items)) return []
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return items
}

export async function addPendingTestimonial(
  data: Omit<StoredTestimonial, 'id' | 'active' | 'createdAt'>
): Promise<StoredTestimonial> {
  const items = await getPendingTestimonials()
  const newItem: StoredTestimonial = {
    ...data,
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    active: false,
    createdAt: new Date().toISOString(),
  }
  const updated = [newItem, ...items]
  await writeJson('testimonials-pending', TESTIMONIALS_FILE, updated)
  return newItem
}

export async function getAllPendingTestimonials(): Promise<StoredTestimonial[]> {
  return getPendingTestimonials()
}

export async function deletePendingTestimonial(id: string): Promise<void> {
  const items = await getPendingTestimonials()
  await writeJson('testimonials-pending', TESTIMONIALS_FILE, items.filter(t => t.id !== id))
}

export async function approvePendingTestimonial(id: string): Promise<StoredTestimonial | null> {
  const items = await getPendingTestimonials()
  const idx = items.findIndex(t => t.id === id)
  if (idx < 0) return null
  items[idx].active = true
  await writeJson('testimonials-pending', TESTIMONIALS_FILE, items)
  return items[idx]
}
