'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowLeft, CreditCard, ShieldCheck, Lock, AlertCircle, LayoutDashboard, Clock, Globe, Store, FileText } from 'lucide-react'

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

const ADD_ON_MAP: Record<string, { name: string }> = {
  seo: { name: 'Advanced SEO Package' },
  analytics: { name: 'Analytics Dashboard' },
  multilang: { name: 'Multi-Language Support' },
  ecommerce: { name: 'E-Commerce Module' },
  blog: { name: 'Blog & Content Studio' },
  social: { name: 'Social Media Integration' },
  chat: { name: 'Live Chat Widget' },
  security: { name: 'Advanced Security Suite' },
  backup: { name: 'Automated Backups' },
  speed: { name: 'Performance Booster' },
}

const FREE_FEATURES_LIMIT = 5

// Hardcoded fallback prices — used if /api/plans is unreachable.
// These mirror the production values and are kept in sync manually.
// Includes all 6 plans (3 regular + 3 store variants).
const FALLBACK_PRICES: Record<string, number> = {
  monthly: 30,
  semi_annual: 160,
  annual: 300,
  store: 100,
  store_semi_annual: 550,
  store_annual: 1100,
}

// Store Package adds these features on top of the regular plan features.
// Displayed in the checkout summary so the customer sees what they get extra.
const STORE_PACKAGE_FEATURES = [
  'Daily automated backups',
  'Full e-commerce / store functionality',
  'Unlimited products & categories',
  'Payment gateway integration (Stripe / PayPal)',
  'Inventory management dashboard',
  'Order tracking & customer accounts',
  '100 GB hosting storage',
  'Priority 24/7 support with dedicated manager',
]

// Plan type options for the toggle at the top of checkout
type PlanType = 'regular' | 'store'

interface PaymentGateway {
  id: string
  name: string
  provider: string
  active: boolean
  testMode: boolean
}

export default function CheckoutPage() {
  const { checkoutData, setCurrentPage, setCheckoutData, user } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card')
  const [processing, setProcessing] = useState(false)
  const [planPrices, setPlanPrices] = useState<Record<string, number>>(FALLBACK_PRICES)
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  // Plan type is LOCKED from the TemplatePreview page — user cannot change it here.
  // This prevents customers from selecting Store Package but paying Regular price.
  const planType: PlanType = checkoutData?.planType === 'store' ? 'store' : 'regular'

  // Fetch plan prices and active payment gateways from API so admin changes reflect here.
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
          // Only show active gateways; if none active, fallback list (below) is used.
          setGateways(data.filter((g: PaymentGateway) => g.active))
        }
      })
      .catch(() => {})
  }, [])

  if (!checkoutData) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4F5B76] mb-4">No checkout data found.</p>
          <Button onClick={() => setCurrentPage('templates')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
        </div>
      </div>
    )
  }

  const { templateTitle, templateImage, templateCategory, templateFeatures, billing: rawBilling, selectedAddOns, domain, domainPrice } = checkoutData

  // Normalize billing to its base cycle (store → monthly, store_semi_annual → semi_annual, etc.)
  // This is needed because TemplatePreview sends effectiveBilling (e.g. 'store', 'store_annual')
  // but CheckoutPage needs the cycle to compute months and periods.
  const billing = rawBilling === 'store' ? 'monthly'
    : rawBilling === 'store_semi_annual' ? 'semi_annual'
    : rawBilling === 'store_annual' ? 'annual'
    : rawBilling

  // The effective billing interval for price lookup (store_* when Store Package)
  const effectiveBilling = planType === 'store'
    ? (billing === 'monthly' ? 'store' : billing === 'semi_annual' ? 'store_semi_annual' : 'store_annual')
    : billing

  // Use API price when available, else fallback
  const basePrice = planPrices[effectiveBilling] ?? FALLBACK_PRICES[effectiveBilling] ?? (planType === 'store' ? 100 : 30)
  const billingMonths = billing === 'monthly' ? 1 : billing === 'semi_annual' ? 6 : 12
  const addOnUnitCost = selectedAddOns.length * 3 * billingMonths
  const addOnTotal = addOnUnitCost
  const extraFeaturesCount = Math.max(0, templateFeatures.length - FREE_FEATURES_LIMIT)
  const extraFeatureTotal = extraFeaturesCount * 3 * billingMonths
  // Domain cost calculation
  const domainBaseIncluded = 50
  const domainExcess = domainPrice ? Math.max(0, domainPrice - domainBaseIncluded) : 0
  const domainMonthlyInstallment = domainExcess > 0 ? 3 : 0
  const domainInstallmentMonths = domainMonthlyInstallment > 0 ? Math.ceil(domainExcess / domainMonthlyInstallment) : 0
  const domainInstallmentTotal = domainMonthlyInstallment * billingMonths
  const total = basePrice + addOnTotal + extraFeatureTotal + domainInstallmentTotal
  const period = billing === 'monthly' ? 'mo' : billing === 'semi_annual' ? '6mo' : 'yr'

  // Plan type display info
  const planTypeLabel = planType === 'store' ? 'Store Package' : 'Regular'
  const planTypeColor = planType === 'store' ? '#F59E0B' : '#00D1FF'

  // Build payment methods list: prefer active gateways from API, fallback to defaults
  const buildMethodList = () => {
    const methodMeta: Record<string, { label: string; desc: string; icon: string }> = {
      card: { label: 'Credit / Debit Card', desc: 'Visa, Mastercard, AMEX', icon: '💳' },
      paypal: { label: 'PayPal', desc: 'Pay with your PayPal account', icon: '🅿️' },
      bank: { label: 'Bank Transfer', desc: 'Direct bank wire transfer', icon: '🏦' },
    }
    if (gateways.length === 0) {
      // Fallback: show all three
      return (['card', 'paypal', 'bank'] as const).map(id => ({ id, ...methodMeta[id] }))
    }
    // Map API providers to method IDs (stripe→card, paypal→paypal, bank→bank)
    const providerToId: Record<string, 'card' | 'paypal' | 'bank'> = {
      stripe: 'card',
      paypal: 'paypal',
      bank: 'bank',
    }
    return gateways
      .map(g => {
        const id = providerToId[g.provider]
        if (!id) return null
        return { id, ...methodMeta[id] }
      })
      .filter(Boolean) as { id: 'card' | 'paypal' | 'bank'; label: string; desc: string; icon: string }[]
  }
  const methods = buildMethodList()
  // Ensure current paymentMethod is in the available list
  const effectiveMethod = methods.find(m => m.id === paymentMethod) ? paymentMethod : (methods[0]?.id ?? 'card')

  const handlePayment = async () => {
    setProcessing(true)

    // Build invoice items
    const planLabel = planType === 'store'
      ? (billing === 'monthly' ? 'Store Monthly' : billing === 'semi_annual' ? 'Store Semi-Annual' : 'Store Annual')
      : (billing === 'monthly' ? 'Monthly' : billing === 'semi_annual' ? 'Semi-Annual' : 'Annual')
    const invoiceItems: { description: string; amount: number }[] = [
      { description: `${templateTitle} — ${planLabel} Plan${planType === 'store' ? ' (Store Package)' : ''}`, amount: basePrice },
    ]
    if (extraFeaturesCount > 0) {
      invoiceItems.push({ description: `Extra Features (${extraFeaturesCount} x $3/${period})`, amount: extraFeatureTotal })
    }
    selectedAddOns.forEach((id) => {
      const name = ADD_ON_NAMES[id] || id
      invoiceItems.push({ description: `${name}`, amount: addOnUnitCost })
    })
    if (domain && domainMonthlyInstallment > 0) {
      invoiceItems.push({ description: `Domain Installment — ${domain} (${domainInstallmentMonths} x $3)`, amount: domainInstallmentTotal })
    }

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    try {
      // Create order with all features data
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          templateId: checkoutData.templateId,
          status: 'pending',
          progress: 0,
          // Send milestones as full objects so the admin panel can show
          // status badges immediately. The first milestone (Order Confirmed)
          // is auto-marked completed when the order is placed (payment received).
          // 7-stage lifecycle with custom progress mapping:
          //   1. Order Confirmed           → 17%
          //   2. Design Phase              → 33%
          //   3. Customer Review           → 50%
          //   4. Development & Integration → 67%
          //   5. Testing & QA              → 83%
          //   6. Final Preview             → 83% (checkpoint, no increase)
          //   7. Deployment & Delivery     → 100%
          milestones: JSON.stringify([
            { name: 'Order Confirmed',           status: 'completed', date: new Date().toISOString() },
            { name: 'Design Phase',              status: 'pending' },
            { name: 'Customer Review',           status: 'pending' },
            { name: 'Development & Integration', status: 'pending' },
            { name: 'Testing & QA',              status: 'pending' },
            { name: 'Final Preview',             status: 'pending' },
            { name: 'Deployment & Delivery',     status: 'pending' },
          ]),
          templateFeatures: JSON.stringify(templateFeatures),
          addOns: JSON.stringify(selectedAddOns),
          billing: effectiveBilling,
          additionalInfo: checkoutData.additionalInfo || null,
          similarSiteUrl: checkoutData.similarSiteUrl || null,
          similarSiteCriteria: JSON.stringify(checkoutData.similarSiteCriteria || []),
          domain: domain || null,
          domainPrice: domainPrice || null,
        }),
      })

      if (!orderRes.ok) {
        console.error('[CheckoutPage] Order creation HTTP error:', orderRes.status)
      }

      // Send invoice email
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
                total,
                billing: effectiveBilling,
                paymentMethod: effectiveMethod === 'card' ? 'Credit/Debit Card' : effectiveMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
                siteUrl: `${window.location.origin}`,
              },
            }),
          })
        } catch { /* email failure shouldn't block checkout */ }
      }
    } catch (orderError) {
      console.error('[CheckoutPage] Order creation failed:', orderError)
      // Show error toast but still redirect — order data is in checkoutData
      // and admin can manually follow up. Better than blocking the user.
      try {
        const { toast } = await import('sonner')
        toast.error('Order processing issue', {
          description: 'Your payment was received but order creation had a problem. Our team will contact you shortly.',
        })
      } catch {}
    }
    setTimeout(() => {
      setProcessing(false)
      setCheckoutData(null)
      setCurrentPage('dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2000)
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
          onClick={() => {
            setCurrentPage('templates')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="text-[#43474d]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Plan Type Summary — read-only, locked from TemplatePreview selection.
          User CANNOT change plan type here. Shows which plan they selected. */}
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
                  ? 'Includes e-commerce + daily backups + priority support'
                  : 'Professional design + hosting + maintenance'
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${planType === 'store' ? 'text-[#F59E0B]' : 'text-[#00D1FF]'}`}>
              ${planPrices[effectiveBilling] ?? FALLBACK_PRICES[effectiveBilling] ?? (planType === 'store' ? 100 : 30)}
              <span className="text-xs text-[#4F5B76] font-normal">/{period}</span>
            </p>
            <p className="text-[10px] text-[#74777e] uppercase tracking-wide">
              {billing === 'monthly' ? 'Monthly' : billing === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Order Details + Payment (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Template */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#000f22] flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              Selected Template
            </h2>
            <div className="flex gap-4">
              <img
                src={templateImage}
                alt={templateTitle}
                className="w-28 h-20 rounded-xl object-cover flex-shrink-0 border border-[#e6ebf1]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#000f22]">{templateTitle}</h3>
                <Badge className="mt-1 bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] text-xs">
                  {templateCategory}
                </Badge>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {templateFeatures.map((f, i) => (
                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      i < FREE_FEATURES_LIMIT
                        ? 'bg-[#f7fafd] text-[#43474d] border-[#e6ebf1]'
                        : 'bg-[#FFF8E1] text-[#92400E] border-[#FFE082]'
                    }`}>
                      {f}{i >= FREE_FEATURES_LIMIT && ' (+$3)'}
                    </span>
                  ))}
                </div>
                {extraFeaturesCount > 0 && (
                  <p className="text-[10px] text-[#F59E0B] mt-2">
                    {extraFeaturesCount} extra feature{extraFeaturesCount > 1 ? 's' : ''} beyond the {FREE_FEATURES_LIMIT} free included
                  </p>
                )}
                {domain && (
                  <div className="mt-2 flex items-center gap-1.5 p-2 rounded-lg bg-[#FF6B35]/5 border border-[#FF6B35]/20">
                    <Globe className="h-3.5 w-3.5 text-[#FF6B35]" />
                    <span className="text-xs font-medium text-[#FF6B35]">{domain}</span>
                    <span className="text-[10px] text-[#74777e]">${domainPrice?.toFixed(2)}/yr</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Add-ons */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4">Selected Add-Ons</h2>
            {selectedAddOns.length === 0 ? (
              <p className="text-sm text-[#74777e] py-2">No add-ons selected. You can add them later from your dashboard.</p>
            ) : (
              <div className="space-y-3">
                {selectedAddOns.map((id) => {
                  const addOn = ADD_ON_MAP[id]
                  return addOn ? (
                    <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7fafd]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#00D1FF]/10 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-[#00D1FF]" />
                        </div>
                        <span className="text-sm font-medium text-[#000f22]">{addOn.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-[#000f22]">+${addOnUnitCost}/{period}</span>
                    </div>
                  ) : null
                })}
              </div>
            )}

            {(selectedAddOns.length > 0 || extraFeaturesCount > 0) && (
              <div className="mt-4 p-3 rounded-xl bg-[#FFF8E1] border border-[#FFE082] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#92400E] leading-relaxed">
                  <span className="font-semibold">Important:</span> Extra features and add-ons fees are charged for the <span className="font-semibold">first year only</span>. 
                  After the first year, your subscription will renew at the base plan price (${basePrice}/{period}).
                </p>
              </div>
            )}
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
                    <p className="text-xs text-[#74777e]">{method.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    effectiveMethod === method.id ? 'border-[#00D1FF]' : 'border-[#c4c6ce]'
                  }`}>
                    {effectiveMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#00D1FF]" />}
                  </div>
                </button>
              ))}
              {methods.length === 0 && (
                <div className="p-4 rounded-xl bg-[#FFF8E1] border border-[#FFE082] text-xs text-[#92400E]">
                  No active payment gateways. Please configure them from Admin → Payments.
                </div>
              )}
            </div>

            {/* Card form placeholder */}
            {effectiveMethod === 'card' && (
              <div className="mt-5 space-y-4 p-4 rounded-xl bg-[#f7fafd] border border-[#e6ebf1]">
                <div>
                  <label className="text-xs font-medium text-[#43474d] mb-1.5 block">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#e6ebf1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#43474d] mb-1.5 block">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#e6ebf1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#43474d] mb-1.5 block">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2.5 rounded-lg border border-[#e6ebf1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#43474d] mb-1.5 block">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 rounded-lg border border-[#e6ebf1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] rounded-2xl p-6 text-white sticky top-20">
            <h3 className="font-bold text-lg mb-5">Order Summary</h3>

            {/* Template */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#768dad]/20">
              <img src={templateImage} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{templateTitle}</p>
                <p className="text-xs text-[#768dad]">{templateCategory} Template</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 mb-5 pb-5 border-b border-[#768dad]/20">
              <div className="flex justify-between text-sm">
                <span className="text-[#768dad] flex items-center gap-1.5">
                  {planType === 'store' && <Store className="h-3.5 w-3.5 text-[#F59E0B]" />}
                  {planType === 'store' ? 'Store Package' : 'Plan'} ({billing === 'monthly' ? 'Monthly' : billing === 'semi_annual' ? 'Semi-Annual' : 'Annual'})
                </span>
                <span className={`font-medium ${planType === 'store' ? 'text-[#F59E0B]' : ''}`}>${basePrice}.00/{period}</span>
              </div>

              {extraFeaturesCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#768dad]">Extra features ({extraFeaturesCount} × $3/mo)</span>
                  <span className="font-medium text-[#F59E0B]">+${extraFeatureTotal}.00/{period}</span>
                </div>
              )}

              {selectedAddOns.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#768dad]">Add-ons ({selectedAddOns.length}x $3/mo)</span>
                  <span className="font-medium text-[#00D1FF]">+${addOnTotal}.00/{period}</span>
                </div>
              )}

              {domain && domainMonthlyInstallment > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#768dad]">Domain installment ({domainInstallmentMonths} × $3)</span>
                  <span className="font-medium text-[#FF6B35]">+${domainInstallmentTotal}.00/{period}</span>
                </div>
              )}

              {(extraFeaturesCount > 0 || selectedAddOns.length > 0 || (domain && domainMonthlyInstallment > 0)) && (
                <div className="p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                  <p className="text-[10px] text-[#10B981] leading-relaxed">
                    <span className="font-semibold">After year 1:</span> Renewal at ${basePrice}/{period} only (extra features & add-ons charges apply first year)
                  </p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[#768dad]">Total Due Today</span>
              <div className="text-right">
                <span className="text-4xl font-bold">${total}</span>
                <span className="text-[#768dad] text-sm">/{period}</span>
              </div>
            </div>

            {/* Delivery & Dashboard alerts */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                <LayoutDashboard className="h-4 w-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#10B981] leading-relaxed">
                  <span className="font-semibold">Website Control Panel Included</span> — Full dashboard to manage your website.
                </p>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/20">
                <Clock className="h-4 w-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#67e8f9] leading-relaxed">
                  <span className="font-semibold">Delivery: 5-7 Business Days</span> — Your website will be ready within 5 to 7 business days.
                </p>
              </div>
            </div>

            {/* Pay button */}
            <Button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-bold h-12 text-base disabled:opacity-60"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#000f22] border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${total}.00
                </>
              )}
            </Button>

            {/* Security badges */}
            <div className="mt-5 flex items-center justify-center gap-4 text-[#768dad]">
              <div className="flex items-center gap-1.5 text-[10px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                SSL Secure
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <Lock className="h-3.5 w-3.5" />
                Encrypted
              </div>
            </div>

            {/* Customer info */}
            {user && (
              <div className="mt-5 pt-4 border-t border-[#768dad]/20">
                <p className="text-[10px] text-[#768dad]">Purchasing as</p>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[#768dad]">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
