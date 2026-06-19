import { NextRequest, NextResponse } from 'next/server'
import {
  getContactMessages,
  addContactMessage,
  markContactMessageRead,
  deleteContactMessage,
} from '@/lib/file-store'

export async function GET() {
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
    // 2) Fallback to file-based store
    const fileMessages = await getContactMessages()
    return NextResponse.json(fileMessages)
  }
}

export async function POST(req: NextRequest) {
  const { name, email, subject, category, message } = await req.json()
  if (!name || !email || !subject || !category || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const cleaned = {
    name: String(name).trim().slice(0, 120),
    email: String(email).trim().slice(0, 200),
    subject: String(subject).trim().slice(0, 200),
    category: String(category),
    message: String(message).slice(0, 5000),
  }

  // 1) Try the database first
  try {
    const { db } = await import('@/lib/db')
    const contact = await db.contactMessage.create({ data: cleaned })
    return NextResponse.json(contact)
  } catch (e) {
    // 2) Fallback: persist to file-store so admin can see the message
    const stored = await addContactMessage(cleaned)
    return NextResponse.json(stored)
  }
}

// PUT — mark as read/unread
export async function PUT(req: NextRequest) {
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
  } catch {
    // Fallback: file-store
    if (action === 'delete') {
      await deleteContactMessage(id)
    } else if (action === 'read') {
      await markContactMessageRead(id)
    }
    return NextResponse.json({ ok: true, id, action })
  }
}

// DELETE — remove a message
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })

  try {
    const { db } = await import('@/lib/db')
    await db.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    await deleteContactMessage(id)
    return NextResponse.json({ ok: true })
  }
}
