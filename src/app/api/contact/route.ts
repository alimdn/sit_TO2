import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const { name, email, subject, category, message } = await req.json()
  if (!name || !email || !subject || !category || !message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }
  const contact = await db.contactMessage.create({
    data: { name, email, subject, category, message },
  })
  return NextResponse.json(contact)
}
