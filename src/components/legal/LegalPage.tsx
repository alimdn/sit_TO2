'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Trash2, Edit3 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface LegalPageProps {
  pageType: 'about' | 'privacy' | 'terms' | 'support'
}

const PAGE_META: Record<string, { title: string; settingKey: string; defaultContent: string }> = {
  about: {
    title: 'About Us',
    settingKey: 'page_about',
    defaultContent: `# About WebForge

WebForge is a professional website design and hosting subscription service. We believe that every business deserves a beautiful, functional website without the prohibitive upfront costs of traditional web development.

## Our Mission

To democratize professional web design by making it accessible through an affordable monthly subscription model. We handle the design, hosting, maintenance, and security so you can focus on what matters most — running your business.

## What We Do

- **Design:** We create stunning, modern websites tailored to your brand
- **Host:** Reliable, fast hosting with SSL included
- **Maintain:** Regular updates, security patches, and technical support
- **Support:** Our team is here to help you every step of the way

## Our Promise

Professional design, transparent pricing, and no long-term contracts. Cancel anytime.

---

© 2026 WebForge. All rights reserved.`,
  },
  privacy: {
    title: 'Privacy Policy',
    settingKey: 'page_privacy',
    defaultContent: `# Privacy Policy

Last updated: January 2026

## Information We Collect

We collect information you provide directly to us, such as:
- Name, email address, and contact details when you register
- Payment information for subscription billing
- Website content and preferences you share with us

## How We Use Your Information

- To provide and maintain your website subscription
- To process payments and send invoices
- To communicate with you about your account and services
- To improve our services and user experience

## Data Security

We use industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your data.

## Third-Party Services

We use trusted third-party services for:
- Payment processing (Stripe, PayPal)
- Cloud hosting (Vercel)
- Image storage (Cloudinary)
- Database hosting (Supabase)

## Your Rights

You have the right to:
- Access your personal data
- Request data deletion
- Update your information
- Cancel your subscription at any time

## Contact

For privacy questions, contact us at support@webforge.com

---

© 2026 WebForge. All rights reserved.`,
  },
  terms: {
    title: 'Terms of Service',
    settingKey: 'page_terms',
    defaultContent: `# Terms of Service

Last updated: January 2026

## Subscription Agreement

By subscribing to WebForge, you agree to the following terms:

### 1. Services
WebForge provides professional website design, hosting, and maintenance services on a subscription basis (monthly, semi-annual, or annual).

### 2. Pricing
- Monthly: $30/month (Regular) or $100/month (Store Package)
- Semi-Annual: $160/6 months or $550/6 months (Store)
- Annual: $300/year or $1,100/year (Store)
- Prices include hosting, SSL, and basic maintenance
- Additional features and add-ons are charged at $3/month each

### 3. Payment
- Payments are processed at the start of each billing cycle
- We accept credit/debit cards, PayPal, and bank transfers
- Failed payments enter a 1-month grace period before service termination

### 4. Cancellation
- You can cancel anytime from your dashboard
- Cancellation takes effect at the end of the current billing period
- No refunds for partial billing periods

### 5. Delivery Timeline
- Website delivery: 5-7 business days after order confirmation
- Revisions: Included based on your selected plan features

### 6. Intellectual Property
- You own all content you provide to us
- We retain ownership of the template designs and code framework
- You receive a license to use the website for the duration of your subscription

### 7. Limitation of Liability
WebForge is not liable for:
- Business losses due to website downtime
- Third-party service failures
- Data loss beyond our control

### 8. Changes to Terms
We reserve the right to update these terms. Subscribers will be notified of significant changes.

---

© 2026 WebForge. All rights reserved.`,
  },
  support: {
    title: 'Support Center',
    settingKey: 'page_support',
    defaultContent: `# Support Center

We're here to help! Choose how you'd like to reach us:

## Email Support
**support@webforge.com**
Response time: Within 24 hours

## Support Tickets
Log in to your dashboard and navigate to the Support section to create a support ticket. Track the status of your requests in real-time.

## Common Questions

### How long does website delivery take?
5-7 business days after order confirmation.

### Can I change my plan?
Yes! You can upgrade or downgrade your plan anytime from your dashboard.

### What happens if I cancel?
Your website remains active until the end of your current billing period. After that, it enters a 1-month grace period before permanent termination.

### Do you offer refunds?
We don't offer refunds for partial billing periods, but you can cancel anytime to avoid future charges.

### Can I get a custom domain?
Yes! Use the domain search tool during checkout, or add one later from your dashboard.

## Need More Help?

Don't hesitate to reach out. Our team is committed to making your WebForge experience exceptional.

---

© 2026 WebForge. All rights reserved.`,
  },
}

export default function LegalPage({ pageType }: LegalPageProps) {
  const { setCurrentPage, user } = useAppStore()
  const meta = PAGE_META[pageType]
  const [content, setContent] = useState(meta.defaultContent)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/settings`)
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const setting = data.find(s => s.key === meta.settingKey)
        if (setting && setting.value) {
          setContent(setting.value)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [meta.settingKey])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: meta.settingKey, value: editContent }),
      })
      if (res.ok) {
        toast.success('Content saved successfully')
        setContent(editContent)
        setIsEditing(false)
      } else {
        toast.error('Failed to save content')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: meta.settingKey, value: '' }),
      })
      if (res.ok) {
        toast.success('Content reset to default')
        setContent(meta.defaultContent)
        setIsEditing(false)
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  // Simple markdown to HTML rendering
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n')
    const elements: React.ReactNode[] = []
    let listItems: string[] = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4 text-[#43474d]">
            {listItems.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
          </ul>
        )
        listItems = []
      }
    }

    lines.forEach((line, i) => {
      if (line.startsWith('# ')) {
        flushList()
        elements.push(<h1 key={i} className="text-3xl font-bold text-[#29503c] mb-4">{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        flushList()
        elements.push(<h2 key={i} className="text-xl font-bold text-[#29503c] mt-6 mb-3">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        flushList()
        elements.push(<h3 key={i} className="text-lg font-semibold text-[#29503c] mt-4 mb-2">{line.slice(4)}</h3>)
      } else if (line.startsWith('---')) {
        flushList()
        elements.push(<hr key={i} className="border-[#c1c8c1] my-6" />)
      } else if (line.startsWith('- ')) {
        listItems.push(line.slice(2))
      } else if (line.trim() === '') {
        flushList()
      } else {
        flushList()
        elements.push(<p key={i} className="text-[#43474d] leading-relaxed mb-3">{line}</p>)
      }
    })
    flushList()
    return elements
  }

  return (
    <div className="page-enter py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="flex items-center gap-2 text-sm text-[#414843] hover:text-[#29503c] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Title + Admin actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#29503c]" style={{ letterSpacing: '-0.02em' }}>
            {meta.title}
          </h1>
          {isAdmin && !isEditing && (
            <Button
              onClick={() => { setEditContent(content); setIsEditing(true) }}
              variant="outline"
              className="h-9 border-[#c1c8c1] hover:bg-[#faf9f6]"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Content */}
        {!loaded ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-[3px] border-[#416853] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={25}
              className="w-full p-4 rounded-xl border border-[#c1c8c1] text-sm text-[#29503c] font-mono focus:outline-none focus:ring-2 focus:ring-[#416853]/20 focus:border-[#416853] transition-all bg-[#faf9f6]"
              placeholder="Enter content here (supports Markdown)..."
            />
            <p className="text-xs text-[#717973]">Supports Markdown: # Heading, ## Subheading, - List items, --- divider</p>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#29503c] hover:bg-[#284e3b] text-white h-10"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Content'}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={saving}
                variant="outline"
                className="h-10 border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/5"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="h-10 border-[#c1c8c1]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-card border border-[#c1c8c1]">
            {content ? renderMarkdown(content) : (
              <p className="text-[#414843] text-center py-8">No content available. {isAdmin && 'Click Edit to add content.'}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
