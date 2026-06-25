import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { markContactMessageRead, deleteContactMessage } from '@/lib/file-store'

// PUT /api/contact/[id] — admin-only (mark message as read/unread or delete)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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
  } catch (e) {
    console.error('[api/contact/[id]] PUT DB error:', e)
    // Fallback to file-store
    if (action === 'delete') {
      await deleteContactMessage(id)
    } else if (action === 'read') {
      await markContactMessageRead(id)
    }
    return NextResponse.json({ ok: true, id, action })
  }
}

// DELETE /api/contact/[id] — admin-only (remove a message)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const { db } = await import('@/lib/db')
    await db.contactMessage.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/contact/[id]] DELETE DB error:', e)
    await deleteContactMessage(id)
    return NextResponse.json({ ok: true })
  }
}
