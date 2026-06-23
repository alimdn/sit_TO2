'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type CheckoutData } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowLeft, CreditCard, ShieldCheck, Lock, AlertCircle, LayoutDashboard, Clock, Globe, Store, FileText, Trash2 } from 'lucide-react'

const ADD_ON_NAMES: Record<string, string> = {
  seo: 'Advanced SEO Package',
  analytics: 'Analytics Dashboard',
  multilang: 'Multi-Language Support',
  ecommerce: 'E-Commerce Module',
  blog: 'Blog & Content Studio',
  social: 'Social Media Integration',
  chat: 'Live Chat Widget',
  security: 'Advanced Security Suite',
  backup: 'Automated Backups',
  speed: 'Performance Booster',
}

const FREE_FEATURES_LIMIT = 5
const STORE_FREE_FEATURES_LIMIT = 10

const FALLBACK_PRICES: Record<string, number> = {
  monthly: 30,
  semi_annual: 160,
  annual: 300,
  store: 100,
  store_semi_annual: 550,
  store_annual: 1100,
}

interface PaymentGateway {
  id: string
  name: string
  provider: string
  active: boolean
  testMode: boolean
}

// Compute per-item pricing
function calcItem(item: CheckoutData, planPrices: Record<string, number>) {
  const rawBilling = item.billing
  const billing = rawBilling === 'store' ? 'monthly'
    : rawBilling === 'store_semi_annual' ? 'semi_annual'
    : rawBilling === 'store_annual' ? 'annual'
    : rawBilling
  const planType = item.planType === 'store' ? 'store' : 'regular'
  const effectiveBilling = planType === 'store'
    ? (billing === 'monthly' ? 'store' : billing === 'semi_annual' ? 'store_semi_annual' : 'store_annual')
    : billing
  const basePrice = planPrices[effectiveBilling] ?? FALLBACK_PRICES[effectiveBilling] ?? (planType === 'store' ? 100 : 30)
  const billingMonths = billing === 'monthly' ? 1 : billing === 'semi_annual' ? 6 : 12
  const addOnTotal = item.selectedAddOns.length * 3 * billingMonths
  const freeLimit = planType === 'store' ? STORE_FREE_FEATURES_LIMIT : FREE_FEATURES_LIMIT
  const extraFeaturesCount = Math.max(0, item.templateFeatures.length - freeLimit)
  const extraFeatureTotal = extraFeaturesCount * 3 * billingMonths
  const domainExcess = item.domainPrice ? Math.max(0, item.domainPrice - 50) : 0
  const domainInstallment = domainExcess > 0 ? 3 * billingMonths : 0
  const total = basePrice + addOnTotal + extraFeatureTotal + domainInstallment
  const period = billing === 'monthly' ? 'mo' : billing === 'semi_annual' ? '6mo' : 'yr'

  return { item, planType, billing, basePrice, billingMonths, addOnTotal, freeLimit, extraFeaturesCount, extraFeatureTotal, domainInstallment, total, period }
}

export default function CheckoutPage() {
  const { checkoutItems, setCurrentPage, clearCheckoutItems, removeCheckoutItem, user } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card')
  const [processing, setProcessing] = useState(false)
  const [planPrices, setPlanPrices] = useState<Record<string, number>>(FALLBACK_PRICES)
  const [gateways, setGateways] = useState<PaymentGateway[]>([])

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: Record<string, number> = {}
          data.forEach((p: { interval: string; price: number; active: boolean }) => {
            if (p.active) map[p.interval] = p.price
          })
          if (Object.keys(map).length > 0) setPlanPrices(map)
        }
      })
      .catch(() => {})

    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGateways(data.filter((g: PaymentGateway) => g.active))
        }
      })
      .catch(() => {})
  }, [])

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4F5B76] mb-4">Your cart is empty.</p>
          <Button onClick={() => setCurrentPage('templates')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
        </div>
      </div>
    )
  }

  // Calculate all items
  const itemCalcs = checkoutItems.map(item => calcItem(item, planPrices))
  const grandTotal = itemCalcs.reduce((sum, c) => sum + c.total, 0)
  const planType = itemCalcs[0]?.planType || 'regular'

  // Build payment methods
  const methodMeta: Record<string, { label: string; desc: string; icon: string }> = {
    card: { label: 'Credit / Debit Card', desc: 'Visa, Mastercard, AMEX', icon: '💳' },
    paypal: { label: 'PayPal', desc: 'Pay with your PayPal account', icon: '🅿️' },
    bank: { label: 'Bank Transfer', desc: 'Direct bank wire transfer', icon: '🏦' },
  }
  const methods = gateways.length === 0
    ? (['card', 'paypal', 'bank'] as const).map(id => ({ id, ...methodMeta[id] }))
    : gateways.map(g => {
        const id = ({ stripe: 'card', paypal: 'paypal', bank: 'bank' } as const)[g.provider] || 'card'
        return { id, ...methodMeta[id] }
      }).filter(Boolean) as { id: 'card' | 'paypal' | 'bank'; label: string; desc: string; icon: string }[]
  const effectiveMethod = methods.find(m => m.id === paymentMethod) ? paymentMethod : (methods[0]?.id ?? 'card')

  const handlePayment = async () => {
    setProcessing(true)

    const invoiceItems: { description: string; amount: number }[] = []
    itemCalcs.forEach((c) => {
      const planLabel = c.planType === 'store'
        ? (c.billing === 'monthly' ? 'Store Monthly' : c.billing === 'semi_annual' ? 'Store Semi-Annual' : 'Store Annual')
        : (c.billing === 'monthly' ? 'Monthly' : c.billing === 'semi_annual' ? 'Semi-Annual' : 'Annual')
      invoiceItems.push({ description: `${c.item.templateTitle} — ${planLabel}${c.planType === 'store' ? ' (Store)' : ''}`, amount: c.basePrice })
      if (c.extraFeaturesCount > 0) {
        invoiceItems.push({ description: `${c.item.templateTitle} — Extra Features (${c.extraFeaturesCount} x $3/${c.period})`, amount: c.extraFeatureTotal })
      }
      c.item.selectedAddOns.forEach((id: string) => {
        invoiceItems.push({ description: `${c.item.templateTitle} — ${ADD_ON_NAMES[id] || id}`, amount: c.billingMonths * 3 })
      })
    })

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    try {
      for (const c of itemCalcs) {
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            templateId: c.item.templateId,
            status: 'pending',
            progress: 0,
            milestones: JSON.stringify([
              { name: 'Order Confirmed', status: 'completed', date: new Date().toISOString() },
              { name: 'Design Phase', status: 'pending' },
              { name: 'Customer Review', status: 'pending' },
              { name: 'Development & Integration', status: 'pending' },
              { name: 'Testing & QA', status: 'pending' },
              { name: 'Final Preview', status: 'pending' },
              { name: 'Deployment & Delivery', status: 'pending' },
            ]),
            templateFeatures: JSON.stringify(c.item.templateFeatures),
            addOns: JSON.stringify(c.item.selectedAddOns),
            billing: c.item.billing,
            additionalInfo: c.item.additionalInfo || null,
            similarSiteUrl: c.item.similarSiteUrl || null,
            similarSiteCriteria: JSON.stringify(c.item.similarSiteCriteria || []),
            domain: c.item.domain || null,
            domainPrice: c.item.domainPrice || null,
          }),
        })
        if (!orderRes.ok) {
          console.error('[CheckoutPage] Order creation HTTP error:', orderRes.status)
        }
      }

      if (user?.email) {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'invoice',
              data: {
                to: user.email,
                customerName: user.name || 'Customer',
                customerEmail: user.email,
                orderId: Date.now().toString(36).toUpperCase(),
                invoiceNumber,
                date: invoiceDate,
                items: invoiceItems,
                total: grandTotal,
                billing: c_item_billing(itemCalcs[0]),
                paymentMethod: effectiveMethod === 'card' ? 'Credit/Debit Card' : effectiveMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
                siteUrl: `${window.location.origin}`,
              },
            }),
          })
        } catch {}
      }
    } catch (orderError) {
      console.error('[CheckoutPage] Order creation failed:', orderError)
      try {
        const { toast } = await import('sonner')
        toast.error('Order processing issue', {
          description: 'Your payment was received but order creation had a problem. Our team will contact you shortly.',
        })
      } catch {}
    }
    setTimeout(() => {
      setProcessing(false)
      clearCheckoutItems()
      setCurrentPage('dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2000)
  }

  function c_item_billing(c: ReturnType<typeof calcItem>) {
    return c.billing
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Checkout
          </h1>
          <p className="text-[#4F5B76] mt-1">Review your order and complete payment</p>
        </div>
        <Button
          variant="outline"
          onClick={() => { setCurrentPage('templates'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="text-[#43474d]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Plan Summary (locked) */}
      <div className={`rounded-2xl p-5 border mb-6 ${
        planType === 'store'
          ? 'bg-gradient-to-r from-[#FFF8E1] to-[#FFFBF0] border-[#F59E0B]/30'
          : 'bg-[#00D1FF]/5 border-[#00D1FF]/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {planType === 'store' ? (
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#00D1FF] flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#000f22]" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-[#000f22]">
                {planType === 'store' ? 'Store Package' : 'Regular Website'}
              </p>
              <p className="text-xs text-[#4F5B76]">
                {planType === 'store'
                  ? `Includes ${STORE_FREE_FEATURES_LIMIT} free features + e-commerce + daily backups`
                  : `Includes ${FREE_FEATURES_LIMIT} free features + hosting + maintenance`
                }
              </p>
            </div>
          </div>
          <Badge className={`text-xs ${planType === 'store' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'}`}>
            {itemCalcs.length} item{itemCalcs.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Cart Items + Payment (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cart Items — multiple templates with delete buttons */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#000f22] flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              Your Cart ({itemCalcs.length} item{itemCalcs.length > 1 ? 's' : ''})
            </h2>
            <div className="space-y-4">
              {itemCalcs.map((c, idx) => (
                <div key={idx} className={`flex gap-4 p-4 rounded-xl border ${
                  c.planType === 'store' ? 'border-[#F59E0B]/30 bg-[#FFF8E1]/30' : 'border-[#e6ebf1]'
                }`}>
                  <img
                    src={c.item.templateImage}
                    alt={c.item.templateTitle}
                    className="w-28 h-20 rounded-xl object-cover flex-shrink-0 border border-[#e6ebf1]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#000f22]">{c.item.templateTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] text-xs">
                            {c.item.templateCategory}
                          </Badge>
                          <Badge className={`text-xs ${c.planType === 'store' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'}`}>
                            {c.planType === 'store' ? '🛍️ Store' : 'Regular'}
                          </Badge>
                        </div>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => removeCheckoutItem(idx)}
                        className="w-8 h-8 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4 text-[#ef4444]" />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.item.templateFeatures.map((f: string, i: number) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          i < c.freeLimit
                            ? 'bg-[#f7fafd] text-[#43474d] border-[#e6ebf1]'
                            : 'bg-[#FFF8E1] text-[#92400E] border-[#FFE082]'
                        }`}>
                          {f}{i >= c.freeLimit && ' (+$3)'}
                        </span>
                      ))}
                    </div>
                    {c.extraFeaturesCount > 0 && (
                      <p className="text-[10px] text-[#F59E0B] mt-2">
                        {c.extraFeaturesCount} extra feature{c.extraFeaturesCount > 1 ? 's' : ''} beyond the {c.freeLimit} free included
                      </p>
                    )}
                    {c.item.domain && (
                      <div className="mt-2 flex items-center gap-1.5 p-2 rounded-lg bg-[#FF6B35]/5 border border-[#FF6B35]/20">
                        <Globe className="h-3.5 w-3.5 text-[#FF6B35]" />
                        <span className="text-xs font-medium text-[#FF6B35]">{c.item.domain}</span>
                        <span className="text-[10px] text-[#74777e]">${c.item.domainPrice?.toFixed(2)}/yr</span>
                      </div>
                    )}
                    <div className="mt-2 text-sm font-bold text-[#000f22]">
                      ${c.total}/{c.period}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Add more templates button */}
            <button
              onClick={() => { setCurrentPage('templates'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-[#c4c6ce] hover:border-[#00D1FF] hover:bg-[#00D1FF]/5 text-sm text-[#74777e] hover:text-[#00D1FF] font-medium transition-all"
            >
              + Add Another Template
            </button>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>
            <div className="space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                    effectiveMethod === method.id
                      ? 'border-[#00D1FF] bg-[#00D1FF]/5 ring-1 ring-[#00D1FF]/30'
                      : 'border-[#e6ebf1] hover:border-[#c4c6ce]'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${effectiveMethod === method.id ? 'text-[#000f22]' : 'text-[#43474d]'}`}>
                      {method.label}
                    </span>
                    <p className="text-xs text-[#74777e] mt-0.5">{method.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    effectiveMethod === method.id ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-[#c4c6ce]'
                  }`}>
                    {effectiveMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] rounded-2xl p-6 text-white sticky top-20">
            <h3 className="font-bold text-lg mb-5">Order Summary</h3>

            {/* Per-item breakdown */}
            <div className="space-y-4 mb-5 pb-5 border-b border-[#768dad]/20">
              {itemCalcs.map((c, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3 pb-2">
                    <img src={c.item.templateImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.item.templateTitle}</p>
                      <p className="text-xs text-[#768dad]">
                        {c.planType === 'store' ? '🛍️ Store' : 'Regular'} · {c.billing === 'monthly' ? 'Monthly' : c.billing === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pl-13">
                    <span className="text-[#768dad]">Base plan</span>
                    <span className={c.planType === 'store' ? 'text-[#F59E0B]' : ''}>${c.basePrice}/{c.period}</span>
                  </div>
                  {c.extraFeaturesCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#768dad]">Extra features ({c.extraFeaturesCount} × $3)</span>
                      <span className="text-[#F59E0B]">+${c.extraFeatureTotal}/{c.period}</span>
                    </div>
                  )}
                  {c.item.selectedAddOns.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#768dad]">Add-ons ({c.item.selectedAddOns.length} × $3)</span>
                      <span className="text-[#00D1FF]">+${c.addOnTotal}/{c.period}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[#768dad] text-sm">Grand Total</span>
              <div className="text-right">
                <span className="text-3xl font-bold">${grandTotal}</span>
                <span className="text-[#768dad] text-sm">/{itemCalcs[0]?.period || 'mo'}</span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="space-y-2 mb-4 mt-4">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                <LayoutDashboard className="h-4 w-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#10B981] leading-relaxed">
                  <span className="font-semibold">Website Control Panel Included</span> — Full dashboard to manage your website.
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/20">
                <Clock className="h-4 w-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#67e8f9] leading-relaxed">
                  <span className="font-semibold">Delivery: 5-7 Business Days</span> — Per item after order confirmation.
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full h-12 font-semibold text-base transition-colors ${
                planType === 'store'
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white'
                  : 'bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22]'
              }`}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${grandTotal}
                </>
              )}
            </Button>

            {!user && (
              <p className="text-[10px] text-[#768dad] text-center mt-2">
                You&apos;ll need to sign in to complete your purchase
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              <p className="text-[10px] text-[#768dad]">Secure SSL encrypted payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
