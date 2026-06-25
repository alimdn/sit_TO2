import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, requireAdmin } from '@/lib/session'

// Fallback gateways — NO real secrets, placeholder strings only.
const fallbackGateways = [
  { id: 'gw-1', name: 'Stripe', provider: 'stripe', active: true, testMode: true, apiKey: 'pk_test_xxxxxxxxxxxxx' },
  { id: 'gw-2', name: 'PayPal', provider: 'paypal', active: false, testMode: true, apiKey: 'sb_xxxxxxxxxxxxx' },
  { id: 'gw-3', name: 'Bank Transfer', provider: 'bank', active: true, testMode: false, config: JSON.stringify({ bankName: 'First National Bank', accountName: 'WebForge LLC', accountNumber: '****4567', routingNumber: '****8901' }) },
]

const SECRET_FIELDS = ['secretKey', 'webhookSecret'] as const

function stripSecrets<T extends Record<string, unknown>>(gw: T): T {
  const out: Record<string, unknown> = { ...gw }
  for (const f of SECRET_FIELDS) { if (f in out) delete out[f] }
  return out as T
}

/** GET /api/payment-gateways — public (active only, secrets stripped). Admins get full record. */
export async function GET(req: NextRequest) {
  const sessionUser = await getSessionFromRequest(req)
  const isAdmin = sessionUser?.role === 'admin'

  try {
    const { db } = await import('@/lib/db')
    const gateways = await db.paymentGateway.findMany()
    if (gateways.length > 0) {
      const filtered = isAdmin
        ? gateways
        : gateways.filter((g) => g.active).map((g) => stripSecrets(g as unknown as Record<string, unknown>))
      return NextResponse.json(filtered)
    }
  } catch (e) {
    console.error('[api/payment-gateways] GET DB error:', e)
  }
  const filtered = isAdmin
    ? fallbackGateways
    : fallbackGateways.filter((g) => g.active).map((g) => stripSecrets(g as unknown as Record<string, unknown>))
  return NextResponse.json(filtered)
}

/** POST /api/payment-gateways — admin-only. */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { db } = await import('@/lib/db')
    const body = await req.json()
    delete body.id
    delete body.createdAt
    const gateway = await db.paymentGateway.create({ data: body })
    return NextResponse.json(gateway)
  } catch (e) {
    console.error('[api/payment-gateways] POST error:', e)
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }
}
