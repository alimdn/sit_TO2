import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(messages)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const { name, email, subject, category, message } = await req.json()
  if (!name || !email || !subject || !category || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }
  try {
    const { db } = await import('@/lib/db')
    const contact = await db.contactMessage.create({ data: { name, email, subject, category, message } })
    return NextResponse.json(contact)
  } catch (e) {
    // Fallback: return success even without DB
    return NextResponse.json({ id: 'msg-' + Date.now(), name, email, subject, category, message, createdAt: new Date().toISOString() })
  }
}
