import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const faqs = await db.fAQ.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(faqs)
}
