import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const links = await db.socialLink.findMany({
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(links)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const link = await db.socialLink.create({ data: body })
  return NextResponse.json(link)
}
