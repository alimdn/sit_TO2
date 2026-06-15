import nodemailer from 'nodemailer'

// Email configuration - uses environment variables or falls back to ethereal email for testing
function getTransporter() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587)
  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  }

  // Fallback: use ethereal email for development/testing
  // This will be created on first use
  return null
}

// Cache the ethereal transporter
let etherealTransporter: nodemailer.Transporter | null = null
let etherealUser: string | null = null

async function getEtherealTransporter() {
  if (etherealTransporter) return { transporter: etherealTransporter, user: etherealUser }

  const testAccount = await nodemailer.createTestAccount()
  etherealUser = testAccount.user
  etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  })

  return { transporter: etherealTransporter, user: etherealUser }
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WebFlowSub'
  const senderEmail = process.env.EMAIL_FROM || 'noreply@webflowsub.com'
  const fromAddress = from || `"${siteName}" <${senderEmail}>`

  let transporter
  const realTransporter = getTransporter()

  if (realTransporter) {
    transporter = realTransporter
  } else {
    const eth = await getEtherealTransporter()
    transporter = eth.transporter
    console.log(`📧 Using Ethereal Email (test): ${eth.user}`)
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    })

    // If using ethereal, log the preview URL
    if (!realTransporter) {
      console.log(`📧 Email preview: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Email send error:', error.message)
    return { success: false, error: error.message }
  }
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px; margin: 0 auto; background: #ffffff; color: #1a1a2e;
`

const headerStyle = `
  background: linear-gradient(135deg, #000f22 0%, #0A2540 100%);
  padding: 32px 40px; text-align: center; border-radius: 12px 12px 0 0;
`

const footerStyle = `
  background: #f7fafd; padding: 24px 40px; text-align: center;
  border-radius: 0 0 12px 12px; border-top: 1px solid #e6ebf1;
`

function emailWrapper(content: string): string {
  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
          Web<span style="color: #00D1FF;">Flow</span>Sub
        </h1>
      </div>
      <div style="padding: 32px 40px;">
        ${content}
      </div>
      <div style="${footerStyle}">
        <p style="margin: 0; color: #74777e; font-size: 12px;">
          © ${new Date().getFullYear()} WebFlowSub — Professional Website Design on Subscription
        </p>
        <p style="margin: 8px 0 0; color: #74777e; font-size: 11px;">
          This is an automated email. Please do not reply directly.
        </p>
      </div>
    </div>
  `
}

// --- ORDER PROGRESS EMAIL ---
export function progressEmailTemplate(data: {
  customerName: string
  orderId: string
  currentStep: string
  stepDescription: string
  progress: number
  milestones: { name: string; status: string }[]
  siteUrl?: string
}): string {
  const stepsHtml = data.milestones.map((m) => {
    const isCompleted = m.status === 'completed'
    const isCurrent = m.status === 'in_progress'
    const icon = isCompleted ? '✅' : isCurrent ? '🔄' : '⬜'
    const color = isCompleted ? '#10B981' : isCurrent ? '#00D1FF' : '#74777e'
    const weight = isCompleted || isCurrent ? '600' : '400'
    return `
      <tr>
        <td style="padding: 8px 0; vertical-align: top; width: 30px; font-size: 16px;">${icon}</td>
        <td style="padding: 8px 0; color: ${color}; font-weight: ${weight}; font-size: 14px;">${m.name}</td>
      </tr>
    `
  }).join('')

  const progressBarInner = `
    <div style="background: #e6ebf1; border-radius: 8px; height: 10px; width: 100%; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #00D1FF, #10B981); height: 100%; width: ${data.progress}%; border-radius: 8px; transition: width 0.3s;"></div>
    </div>
  `

  const content = `
    <p style="margin: 0 0 8px; font-size: 14px; color: #4F5B76;">Hello <strong>${data.customerName}</strong>,</p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #4F5B76; line-height: 1.6;">
      Your order <strong style="color: #000f22;">#${data.orderId}</strong> has been updated.
    </p>

    <div style="background: #00D1FF/10; border: 1px solid #00D1FF/20; border-radius: 12px; padding: 20px; margin-bottom: 24px; background: rgba(0,209,255,0.05); border-color: rgba(0,209,255,0.2);">
      <p style="margin: 0 0 4px; font-size: 12px; color: #74777e; text-transform: uppercase; letter-spacing: 0.05em;">Current Step</p>
      <p style="margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #000f22;">${data.currentStep}</p>
      <p style="margin: 0; font-size: 13px; color: #4F5B76;">${data.stepDescription}</p>
    </div>

    <p style="margin: 0 0 12px; font-size: 13px; font-weight: 600; color: #000f22;">Progress: ${data.progress}%</p>
    ${progressBarInner}

    <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
      <tr>
        <td colspan="2" style="padding: 0 0 12px; font-size: 13px; font-weight: 600; color: #000f22; border-bottom: 1px solid #e6ebf1;">Work Steps</td>
      </tr>
      ${stepsHtml}
    </table>

    ${data.siteUrl ? `
      <div style="margin-top: 24px; padding: 16px; background: #10B981/10; border: 1px solid #10B981/20; border-radius: 10px; background: rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.2);">
        <p style="margin: 0 0 4px; font-size: 12px; color: #10B981; font-weight: 600;">🌐 Track Your Order</p>
        <a href="${data.siteUrl}" style="color: #000f22; font-size: 14px; text-decoration: none; font-weight: 500;">View in your dashboard →</a>
      </div>
    ` : ''}

    <p style="margin: 24px 0 0; font-size: 13px; color: #4F5B76; line-height: 1.6;">
      If you have any questions, please don't hesitate to contact our support team.
    </p>
  `

  return emailWrapper(content)
}

// --- DELIVERY EMAIL ---
export function deliveryEmailTemplate(data: {
  customerName: string
  orderId: string
  websiteUrl: string
  domain: string
  controlPanelUrl: string
  adminEmail: string
  billing: string
  monthlyPrice: number
}): string {
  const content = `
    <p style="margin: 0 0 8px; font-size: 14px; color: #4F5B76;">Hello <strong>${data.customerName}</strong>,</p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #4F5B76; line-height: 1.6;">
      Great news! Your website is now <strong style="color: #10B981;">live and ready</strong>. 🎉
    </p>

    <div style="background: linear-gradient(135deg, #000f22, #0A2540); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #768dad; text-transform: uppercase; letter-spacing: 0.05em;">Your Website</p>
      <p style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #ffffff;">${data.domain}</p>
      <a href="${data.websiteUrl}" style="display: inline-block; background: #00D1FF; color: #000f22; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Visit Your Website</a>
    </div>

    <div style="border: 1px solid #e6ebf1; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <div style="background: #f7fafd; padding: 16px 20px; border-bottom: 1px solid #e6ebf1;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000f22;">📋 Website Details</p>
      </div>
      <div style="padding: 16px 20px;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #74777e; width: 140px;">Website URL</td>
            <td style="padding: 8px 0; font-weight: 500;"><a href="${data.websiteUrl}" style="color: #00D1FF; text-decoration: none;">${data.websiteUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #74777e;">Domain</td>
            <td style="padding: 8px 0; font-weight: 500;">${data.domain}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #74777e;">Control Panel</td>
            <td style="padding: 8px 0;"><a href="${data.controlPanelUrl}" style="color: #00D1FF; text-decoration: none; font-weight: 500;">Open Dashboard →</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #74777e;">Billing</td>
            <td style="padding: 8px 0; font-weight: 500;">${data.billing === 'annual' ? 'Annual' : 'Monthly'} — $${data.monthlyPrice}/${data.billing === 'annual' ? 'yr' : 'mo'}</td>
          </tr>
        </table>
      </div>
    </div>

    <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #10B981;">🖥️ Control Panel Access</p>
      <p style="margin: 0 0 12px; font-size: 13px; color: #4F5B76; line-height: 1.6;">
        You now have full access to your website control panel. From there you can manage content, pages, settings, and more.
      </p>
      <a href="${data.controlPanelUrl}" style="display: inline-block; background: #10B981; color: #ffffff; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Open Control Panel</a>
    </div>

    <div style="background: rgba(0,209,255,0.05); border: 1px solid rgba(0,209,255,0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #00D1FF;">📧 Need Help?</p>
      <p style="margin: 0; font-size: 13px; color: #4F5B76; line-height: 1.6;">
        For any questions or support, contact us at <a href="mailto:${data.adminEmail}" style="color: #00D1FF; text-decoration: none;">${data.adminEmail}</a>
      </p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #4F5B76; line-height: 1.6;">
      Thank you for choosing WebFlowSub. We're excited to have you on board!
    </p>
  `

  return emailWrapper(content)
}

// --- INVOICE / PAYMENT EMAIL ---
export function invoiceEmailTemplate(data: {
  customerName: string
  customerEmail: string
  orderId: string
  invoiceNumber: string
  date: string
  items: { description: string; amount: number }[]
  total: number
  billing: string
  paymentMethod: string
  siteUrl?: string
}): string {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding: 10px 16px; font-size: 13px; color: #43474d; border-bottom: 1px solid #f1f4f7;">${item.description}</td>
      <td style="padding: 10px 16px; font-size: 13px; color: #000f22; font-weight: 500; text-align: right; border-bottom: 1px solid #f1f4f7;">$${item.amount.toFixed(2)}</td>
    </tr>
  `).join('')

  const content = `
    <p style="margin: 0 0 8px; font-size: 14px; color: #4F5B76;">Hello <strong>${data.customerName}</strong>,</p>
    <p style="margin: 0 0 24px; font-size: 14px; color: #4F5B76; line-height: 1.6;">
      Your payment has been received. Here is your invoice.
    </p>

    <div style="border: 1px solid #e6ebf1; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <div style="background: linear-gradient(135deg, #000f22, #0A2540); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="margin: 0 0 4px; font-size: 12px; color: #768dad; text-transform: uppercase; letter-spacing: 0.05em;">Invoice</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">#${data.invoiceNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0 0 4px; font-size: 12px; color: #768dad;">Date</p>
            <p style="margin: 0; font-size: 14px; font-weight: 500; color: #ffffff;">${data.date}</p>
          </div>
        </div>
      </div>

      <div style="padding: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f7fafd;">
            <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #74777e; text-transform: uppercase; letter-spacing: 0.05em; text-align: left;">Description</th>
            <th style="padding: 10px 16px; font-size: 11px; font-weight: 600; color: #74777e; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Amount</th>
          </tr>
          ${itemsHtml}
        </table>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #000f22;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 16px; font-weight: 700; color: #000f22;">Total</span>
            <span style="font-size: 24px; font-weight: 700; color: #000f22;">$${data.total.toFixed(2)}</span>
          </div>
          <p style="margin: 4px 0 0; font-size: 11px; color: #74777e;">
            per ${data.billing === 'annual' ? 'year' : 'month'} · ${data.billing === 'annual' ? 'Annual' : 'Monthly'} billing
          </p>
        </div>
      </div>
    </div>

    <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #10B981;">✅ Payment Confirmed</p>
      <p style="margin: 0; font-size: 12px; color: #4F5B76;">Paid via ${data.paymentMethod} on ${data.date}</p>
    </div>

    <div style="background: #f7fafd; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #74777e; text-transform: uppercase; letter-spacing: 0.05em;">Billed To</p>
      <p style="margin: 0; font-size: 13px; color: #000f22; font-weight: 500;">${data.customerName}</p>
      <p style="margin: 2px 0 0; font-size: 13px; color: #4F5B76;">${data.customerEmail}</p>
    </div>

    ${data.siteUrl ? `
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${data.siteUrl}" style="display: inline-block; background: #00D1FF; color: #000f22; padding: 10px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View in Dashboard</a>
      </div>
    ` : ''}

    <p style="margin: 0; font-size: 13px; color: #4F5B76; line-height: 1.6;">
      Thank you for your payment. You can view all your invoices anytime from your dashboard.
    </p>
  `

  return emailWrapper(content)
}
