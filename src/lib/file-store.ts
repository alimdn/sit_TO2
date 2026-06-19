/**
 * File-based JSON storage for messages and other simple records.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The site currently runs on Vercel without DATABASE_URL configured (the
 * team hasn't enabled Vercel Postgres yet). The existing Prisma-based
 * storage path throws on every call, so POST /api/contact was returning
 * a fake "success" object that wasn't actually persisted anywhere —
 * meaning messages sent from the public Contact Us page never showed up
 * in the admin Messages tab.
 *
 * This module provides a small JSON-file-backed store that works on
 * Vercel serverless (writes go to /tmp on each invocation). It is NOT
 * durable across cold starts or deployments — messages may disappear
 * when a new build is promoted — but it provides immediate functional
 * behaviour until the team enables a real database.
 *
 * When DATABASE_URL is set, the API routes prefer Prisma and skip this
 * fallback entirely.
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

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch {
    // Directory may already exist — ignore
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    await ensureDir()
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  try {
    await ensureDir()
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    // If write fails (e.g. read-only filesystem), silently ignore —
    // the in-memory copy returned to the caller is still valid for
    // the current request lifecycle.
    console.error('file-store write failed:', e)
  }
}

// ─────────────────────────────────────────────────────────────────────
// Contact messages
// ─────────────────────────────────────────────────────────────────────

export async function getContactMessages(): Promise<StoredContactMessage[]> {
  const messages = await readJson<StoredContactMessage[]>(MESSAGES_FILE, [])
  // Sort newest first to match Prisma's orderBy behaviour
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
  messages.unshift(newMessage)
  await writeJson(MESSAGES_FILE, messages)
  return newMessage
}

export async function markContactMessageRead(id: string): Promise<void> {
  const messages = await getContactMessages()
  const idx = messages.findIndex(m => m.id === id)
  if (idx >= 0) {
    messages[idx].isRead = true
    await writeJson(MESSAGES_FILE, messages)
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const messages = await getContactMessages()
  const filtered = messages.filter(m => m.id !== id)
  await writeJson(MESSAGES_FILE, filtered)
}

// ─────────────────────────────────────────────────────────────────────
// Pending testimonials (kept here as a separate store from the public
// Testimonial table, so admin can approve/reject before publishing)
// ─────────────────────────────────────────────────────────────────────

export async function getPendingTestimonials(): Promise<StoredTestimonial[]> {
  const items = await readJson<StoredTestimonial[]>(TESTIMONIALS_FILE, [])
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
  items.unshift(newItem)
  await writeJson(TESTIMONIALS_FILE, items)
  return newItem
}

export async function getAllPendingTestimonials(): Promise<StoredTestimonial[]> {
  return getPendingTestimonials()
}

export async function deletePendingTestimonial(id: string): Promise<void> {
  const items = await getPendingTestimonials()
  await writeJson(TESTIMONIALS_FILE, items.filter(t => t.id !== id))
}

export async function approvePendingTestimonial(id: string): Promise<StoredTestimonial | null> {
  const items = await getPendingTestimonials()
  const idx = items.findIndex(t => t.id === id)
  if (idx < 0) return null
  items[idx].active = true
  await writeJson(TESTIMONIALS_FILE, items)
  return items[idx]
}
