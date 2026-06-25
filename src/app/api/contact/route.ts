import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import {
  getContactMessages,
  addContactMessage,
  markContactMessageRead,
  deleteContactMessage,
} from '@/lib/file-store'

// Simple email regex — validates basic shape (user@domain.tld).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// GET — admin-only (list of all contact messages for the admin panel)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // 1) Prefer the database when available
  try {
    const { db } = await import('@/lib/db')
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    // Merge in file-store messages (in case some were saved before DB was enabled)
    const fileMessages = await getContactMessages()
    const dbIds = new Set(messages.map((m: { id: string }) => m.id))
    const merged = [...messages, ...fileMessages.filter(m => !dbIds.has(m.id))]
    return NextResponse.json(merged)
  } catch (e) {
    console.error('[api/contact] GET error:', e)
    // 2) Fallback to file-based store
    const fileMessages = await getContactMessages()
    return NextResponse.json(fileMessages)
  }
}

// POST — public (anyone can submit a contact message). Validates inputs.
export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { name, email, subject, category, message } = body || {}
  if (!name || !email || !subject || !category || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }
  // Validate email format and field lengths.
  const emailStr = String(email).trim()
  if (!EMAIL_REGEX.test(emailStr) || emailStr.length > 200) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  const nameStr = String(name).trim()
  if (nameStr.length < 1 || nameStr.length > 120) {
    return NextResponse.json({ error: 'Name must be 1–120 characters' }, { status: 400 })
  }
  const subjectStr = String(subject).trim()
  if (subjectStr.length < 1 || subjectStr.length > 200) {
    return NextResponse.json({ error: 'Subject must be 1–200 characters' }, { status: 400 })
  }
  const messageStr = String(message)
  if (messageStr.length < 1 || messageStr.length > 5000) {
    return NextResponse.json({ error: 'Message must be 1–5000 characters' }, { status: 400 })
  }

  const cleaned = {
    name: nameStr,
    email: emailStr,
    subject: subjectStr,
    category: String(category),
    message: messageStr,
  }

  // 1) Try the database first
  try {
    const { db } = await import('@/lib/db')
    const contact = await db.contactMessage.create({ data: cleaned })
    return NextResponse.json(contact)
  } catch (e) {
    console.error('[api/contact] POST DB error:', e)
    // 2) Fallback: persist to file-store so admin can see the message
    const stored = await addContactMessage(cleaned)
    return NextResponse.json(stored)
  }
}

// PUT — admin-only (mark as read/unread or delete)
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, action } = body as { id?: string; action?: 'read' | 'unread' | 'delete' }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  // Try DB first
  try {
    const { db } = await import('@/lib/db')
    if (action === 'delete') {
      await db.contactMessage.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    }
    const updated = await db.contactMessage.update({
      where: { id },
      data: { isRead: action !== 'unread' },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('[api/contact] PUT DB error:', e)
    // Fallback: file-store
    if (action === 'delete') {
      await deleteContactMessage(id)
    } else if (action === 'read') {
      await markContactMessageRead(id)
    }
    return NextResponse.json({ ok: true, id, action })
  }
}

// DELETE — admin-only (remove a message)
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    await db.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/contact] DELETE DB error:', e)
    await deleteContactMessage(id)
    return NextResponse.json({ ok: true })
  }
}
