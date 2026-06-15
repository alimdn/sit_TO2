import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, progressEmailTemplate, deliveryEmailTemplate, invoiceEmailTemplate } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    let subject: string
    let html: string
    let to: string

    switch (type) {
      case 'progress': {
        // data: { to, customerName, orderId, currentStep, stepDescription, progress, milestones, siteUrl }
        if (!data.to) return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
        to = data.to
        subject = `Order Update — ${data.currentStep} (${data.progress}%) | WebFlowSub`
        html = progressEmailTemplate(data)
        break
      }

      case 'delivery': {
        // data: { to, customerName, orderId, websiteUrl, domain, controlPanelUrl, adminEmail, billing, monthlyPrice }
        if (!data.to) return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
        to = data.to
        subject = `🎉 Your Website is Live! — ${data.domain} | WebFlowSub`
        html = deliveryEmailTemplate(data)
        break
      }

      case 'invoice': {
        // data: { to, customerName, customerEmail, orderId, invoiceNumber, date, items, total, billing, paymentMethod, siteUrl }
        if (!data.to) return NextResponse.json({ error: 'Missing recipient email' }, { status: 400 })
        to = data.to
        subject = `Invoice #${data.invoiceNumber} — Payment Confirmation | WebFlowSub`
        html = invoiceEmailTemplate(data)
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid email type. Use: progress, delivery, or invoice' }, { status: 400 })
    }

    const result = await sendEmail({ to, subject, html })

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Send email API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
