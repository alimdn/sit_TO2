import { NextRequest, NextResponse } from 'next/server'

const fallbackGateways = [
  { id: 'gw-1', name: 'Stripe', provider: 'stripe', active: true, testMode: true, apiKey: 'pk_test_xxxxxxxxxxxxx', secretKey: 'sk_test_xxxxxxxxxxxxx' },
  { id: 'gw-2', name: 'PayPal', provider: 'paypal', active: false, testMode: true, apiKey: 'sb_xxxxxxxxxxxxx' },
  { id: 'gw-3', name: 'Bank Transfer', provider: 'bank', active: true, testMode: false, config: JSON.stringify({ bankName: 'First National Bank', accountName: 'WebForge LLC', accountNumber: '****4567', routingNumber: '****8901' }) },
]

export async function GET() {
  try {
    const { db } = await import('@/lib/db')
    const gateways = await db.paymentGateway.findMany()
    if (gateways.length > 0) return NextResponse.json(gateways)
  } catch (e) {
    // Fallback
  }
  return NextResponse.json(fallbackGateways)
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    const gateway = await db.paymentGateway.create({ data: body })
    return NextResponse.json(gateway)
  } catch (e) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
