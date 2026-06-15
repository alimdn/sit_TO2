import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const settings = await db.siteSetting.findMany()
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const { key, value } = await req.json()
    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json(setting)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
