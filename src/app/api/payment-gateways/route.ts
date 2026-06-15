import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const gateways = await db.paymentGateway.findMany()
  return NextResponse.json(gateways)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const gateway = await db.paymentGateway.create({ data: body })
  return NextResponse.json(gateway)
}
