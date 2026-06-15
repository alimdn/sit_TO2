import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const settings = await db.siteSetting.findMany()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const { key, value } = await req.json()
  const setting = await db.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  return NextResponse.json(setting)
}
