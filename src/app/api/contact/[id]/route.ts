import { NextRequest, NextResponse } from 'next/server'
import { markContactMessageRead, deleteContactMessage } from '@/lib/file-store'

// PUT /api/contact/[id] — mark message as read (or perform an action passed via body)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({})) as { action?: 'read' | 'unread' | 'delete' }
  const action = body.action || 'read'

  try {
    const { db } = await import('@/lib/db')
    if (action === 'delete') {
      await db.contactMessage.delete({ where: { id } })
    } else {
      const updated = await db.contactMessage.update({
        where: { id },
        data: { isRead: action !== 'unread' },
      })
      return NextResponse.json(updated)
    }
    return NextResponse.json({ ok: true })
  } catch {
    // Fallback to file-store
    if (action === 'delete') {
      await deleteContactMessage(id)
    } else if (action === 'read') {
      await markContactMessageRead(id)
    }
    return NextResponse.json({ ok: true, id, action })
  }
}

// DELETE /api/contact/[id] — remove a message
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    await db.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    await deleteContactMessage(id)
    return NextResponse.json({ ok: true })
  }
}
