'use client'

import { useState, useEffect } from 'react'
import { useAppStore, type CheckoutData } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ArrowLeft, CreditCard, ShieldCheck, Lock, AlertCircle, LayoutDashboard, Clock, Globe, Store, FileText, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

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
  monthly: 30, semi_annual: 160, annual: 300,
  store: 100, store_semi_annual: 550, store_annual: 1100,
}

interface PaymentGateway {
  id: string; name: string; provider: string; active: boolean; testMode: boolean
}

function calcItem(item: CheckoutData, planPrices: Record<string, number>) {
  const rawBilling = item.billing
  const billing = rawBilling === 'store' ? 'monthly'
    : rawBilling === 'store_semi_annual' ? 'semi_annual'
    : rawBilling === 'store_annual' ? 'annual' : rawBilling
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

// ─── Payment Validation & Simulation ───

interface PaymentDetails {
  cardNumber?: string
  cardName?: string
  cardExpiry?: string
  cardCvv?: string
  paypalEmail?: string
  bankAccount?: string
  bankName?: string
}

interface PaymentResult {
  success: boolean
  error?: string
  transactionId?: string
}

function validatePayment(method: 'card' | 'paypal' | 'bank', details: PaymentDetails): PaymentResult {
  if (method === 'card') {
    if (!details.cardNumber || details.cardNumber.replace(/\s/g, '').length < 16) {
      return { success: false, error: 'Invalid card number. Please enter a valid 16-digit card number.' }
    }
    if (!details.cardName || details.cardName.trim().length < 2) {
      return { success: false, error: 'Please enter the name on the card.' }
    }
    if (!details.cardExpiry || !/^\d{2}\/\d{2}$/.test(details.cardExpiry)) {
      return { success: false, error: 'Invalid expiry date. Use MM/YY format.' }
    }
    // Check if card is expired
    const [month, year] = details.cardExpiry.split('/')
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
    if (expiryDate < new Date()) {
      return { success: false, error: 'Card has expired. Please use a valid card.' }
    }
    if (!details.cardCvv || details.cardCvv.length < 3) {
      return { success: false, error: 'Invalid CVV. Please enter the 3-digit security code.' }
    }
  } else if (method === 'paypal') {
    if (!details.paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.paypalEmail)) {
      return { success: false, error: 'Invalid PayPal email address.' }
    }
  } else if (method === 'bank') {
    if (!details.bankAccount || details.bankAccount.replace(/-/g, '').length < 8) {
      return { success: false, error: 'Invalid bank account number. Minimum 8 digits.' }
    }
    if (!details.bankName || details.bankName.trim().length < 2) {
      return { success: false, error: 'Please enter your bank name.' }
    }
  }
  return { success: true }
}

// Simulate payment processing with a small chance of insufficient funds
function simulatePayment(amount: number): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate, 10% insufficient funds (simulation)
      const isSuccessful = Math.random() > 0.1
      if (isSuccessful) {
        resolve({
          success: true,
          transactionId: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        })
      } else {
        resolve({
          success: false,
          error: `Insufficient funds. Your payment of $${amount} could not be processed. Please try a different payment method or contact your bank.`,
        })
      }
    }, 2000) // 2 second delay to simulate processing
  })
}

// ─── Component ───

export default function CheckoutPage() {
  const { checkoutItems, setCurrentPage, clearCheckoutItems, removeCheckoutItem, user } = useAppStore()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card')
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({})
  const [planPrices, setPlanPrices] = useState<Record<string, number>>(FALLBACK_PRICES)
  const [gateways, setGateways] = useState<PaymentGateway[]>([])

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const map: Record<string, number> = {}
        data.forEach((p: { interval: string; price: number; active: boolean }) => {
          if (p.active) map[p.interval] = p.price
        })
        if (Object.keys(map).length > 0) setPlanPrices(map)
      }
    }).catch((e) => console.error('[CheckoutPage] fetch error:', e))

    fetch('/api/payment-gateways').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setGateways(data.filter((g: PaymentGateway) => g.active))
    }).catch((e) => console.error('[CheckoutPage] fetch error:', e))
  }, [])

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4F5B76] mb-4">Your cart is empty.</p>
          <Button onClick={() => setCurrentPage('templates')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Browse Templates
          </Button>
        </div>
      </div>
    )
  }

  const itemCalcs = checkoutItems.map(item => calcItem(item, planPrices))
  const grandTotal = itemCalcs.reduce((sum, c) => sum + c.total, 0)
  const planType = itemCalcs[0]?.planType || 'regular'

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
    // Step 1: Validate payment details
    setPaymentError(null)
    const validation = validatePayment(effectiveMethod, paymentDetails)
    if (!validation.success) {
      setPaymentError(validation.error!)
      toast.error(validation.error!)
      return
    }

    // Step 2: Start processing
    setProcessing(true)
    setPaymentStatus('processing')

    // Step 3: Simulate payment
    const paymentResult = await simulatePayment(grandTotal)

    if (!paymentResult.success) {
      setPaymentStatus('failed')
      setPaymentError(paymentResult.error!)
      setProcessing(false)
      toast.error('Payment Failed', { description: paymentResult.error })
      return
    }

    // Step 4: Payment succeeded — create orders
    toast.success('Payment Successful! 🎉', {
      description: `Transaction ID: ${paymentResult.transactionId}`,
    })

    try {
      for (const c of itemCalcs) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            templateId: c.item.templateId,
            status: 'in_progress', // Start working immediately
            progress: 17,
            milestones: JSON.stringify([
              { name: 'Order Confirmed', status: 'completed', date: new Date().toISOString() },
              { name: 'Payment Received', status: 'completed', date: new Date().toISOString() },
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
                orderId: paymentResult.transactionId,
                invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                items: itemCalcs.map(c => ({
                  description: `${c.item.templateTitle} — ${c.planType === 'store' ? 'Store Package' : 'Regular'} (${c.billing})`,
                  amount: c.total,
                })),
                total: grandTotal,
                billing: itemCalcs[0]?.billing || 'monthly',
                paymentMethod: effectiveMethod === 'card' ? 'Credit/Debit Card' : effectiveMethod === 'paypal' ? 'PayPal' : 'Bank Transfer',
                siteUrl: `${window.location.origin}`,
              },
            }),
          })
        } catch {}
      }
    } catch (orderError) {
      console.error('[CheckoutPage] Order creation failed:', orderError)
      toast.error('Order processing issue', {
        description: 'Payment was received but order creation had a problem. Our team will contact you.',
      })
    }

    // Step 5: Show success state
    setPaymentStatus('success')

    // Step 6: After showing success, redirect to dashboard
    setTimeout(() => {
      setProcessing(false)
      clearCheckoutItems()
      setCurrentPage('dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 4000)
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  // ─── Success Screen ───
  if (paymentStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-card border border-[#e6ebf1] text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#10B981]/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-bold text-[#000f22] mb-3">Payment Successful!</h1>
          <p className="text-[#4F5B76] mb-8">Your order has been confirmed and work will begin shortly.</p>

          {/* Order summary */}
          <div className="bg-[#f7fafd] rounded-2xl p-6 mb-6 text-left">
            <h3 className="font-bold text-sm text-[#000f22] mb-4">Order Summary</h3>
            {itemCalcs.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-[#e6ebf1] last:border-0">
                <img src={c.item.templateImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#000f22]">{c.item.templateTitle}</p>
                  <p className="text-xs text-[#4F5B76]">
                    {c.planType === 'store' ? '🛍️ Store Package' : 'Regular'} · {c.billing}
                    {' · '}{c.item.templateFeatures.length} features
                    {c.item.selectedAddOns.length > 0 && ` · ${c.item.selectedAddOns.length} add-ons`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-[#000f22]">${c.total}</p>
                  <Badge className="bg-[#10B981]/10 text-[#10B981] text-[9px] mt-1">
                    <Check className="h-2.5 w-2.5 mr-0.5" /> Paid
                  </Badge>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 mt-2">
              <span className="font-bold text-[#000f22]">Total Paid</span>
              <span className="text-2xl font-bold text-[#10B981]">${grandTotal}</span>
            </div>
          </div>

          {/* Delivery info */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex-1">
              <LayoutDashboard className="h-4 w-4 text-[#10B981]" />
              <p className="text-xs text-[#10B981]"><span className="font-semibold">Control Panel Included</span></p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex-1">
              <Clock className="h-4 w-4 text-[#00D1FF]" />
              <p className="text-xs text-[#00D1FF]"><span className="font-semibold">Delivery: 5-7 Business Days</span></p>
            </div>
          </div>

          <p className="text-xs text-[#74777e] mb-6">Redirecting to your dashboard...</p>
          <div className="w-8 h-8 mx-auto border-[3px] border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // ─── Main Checkout ───
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>Checkout</h1>
          <p className="text-[#4F5B76] mt-1">Review your order and complete payment</p>
        </div>
        <Button variant="outline" onClick={() => { setCurrentPage('templates'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-[#43474d]">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      {/* Plan Summary (locked) */}
      <div className={`rounded-2xl p-5 border mb-6 ${planType === 'store' ? 'bg-gradient-to-r from-[#FFF8E1] to-[#FFFBF0] border-[#F59E0B]/30' : 'bg-[#00D1FF]/5 border-[#00D1FF]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {planType === 'store' ? (
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B] flex items-center justify-center"><Store className="h-5 w-5 text-white" /></div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#00D1FF] flex items-center justify-center"><FileText className="h-5 w-5 text-[#000f22]" /></div>
            )}
            <div>
              <p className="font-bold text-sm text-[#000f22]">{planType === 'store' ? 'Store Package' : 'Regular Website'}</p>
              <p className="text-xs text-[#4F5B76]">{planType === 'store' ? `Includes ${STORE_FREE_FEATURES_LIMIT} free features + e-commerce` : `Includes ${FREE_FEATURES_LIMIT} free features + hosting`}</p>
            </div>
          </div>
          <Badge className={`text-xs ${planType === 'store' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'}`}>{itemCalcs.length} item{itemCalcs.length > 1 ? 's' : ''}</Badge>
        </div>
      </div>

      {/* Payment Error Banner */}
      {paymentError && paymentStatus === 'failed' && (
        <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#ef4444]">Payment Failed</p>
            <p className="text-xs text-[#43474d] mt-1">{paymentError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Cart Items + Payment Form (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#000f22] flex items-center justify-center"><Check className="h-4 w-4 text-white" /></div>
              Your Cart ({itemCalcs.length} item{itemCalcs.length > 1 ? 's' : ''})
            </h2>
            <div className="space-y-4">
              {itemCalcs.map((c, idx) => (
                <div key={idx} className={`flex gap-4 p-4 rounded-xl border ${c.planType === 'store' ? 'border-[#F59E0B]/30 bg-[#FFF8E1]/30' : 'border-[#e6ebf1]'}`}>
                  <img src={c.item.templateImage} alt={c.item.templateTitle} className="w-28 h-20 rounded-xl object-cover flex-shrink-0 border border-[#e6ebf1]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#000f22]">{c.item.templateTitle}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-[#f1f4f7] text-[#4F5B76] text-xs">{c.item.templateCategory}</Badge>
                          <Badge className={`text-xs ${c.planType === 'store' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'}`}>{c.planType === 'store' ? '🛍️ Store' : 'Regular'}</Badge>
                        </div>
                      </div>
                      <button onClick={() => removeCheckoutItem(idx)} className="w-8 h-8 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 transition-colors" title="Remove from cart">
                        <Trash2 className="h-4 w-4 text-[#ef4444]" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.item.templateFeatures.map((f: string, i: number) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${i < c.freeLimit ? 'bg-[#f7fafd] text-[#43474d] border-[#e6ebf1]' : 'bg-[#FFF8E1] text-[#92400E] border-[#FFE082]'}`}>
                          {f}{i >= c.freeLimit && ' (+$3)'}
                        </span>
                      ))}
                    </div>
                    {c.item.selectedAddOns.length > 0 && (
                      <p className="text-[10px] text-[#00D1FF] mt-2">{c.item.selectedAddOns.length} add-on(s) selected</p>
                    )}
                    {c.item.additionalInfo && (
                      <p className="text-[10px] text-[#7C3AED] mt-1">📝 Notes: {c.item.additionalInfo.slice(0, 60)}{c.item.additionalInfo.length > 60 ? '...' : ''}</p>
                    )}
                    {c.item.similarSiteUrl && (
                      <p className="text-[10px] text-[#7C3AED] mt-1">🔗 Ref: {c.item.similarSiteUrl}</p>
                    )}
                    {c.item.domain && (
                      <p className="text-[10px] text-[#FF6B35] mt-1">🌐 {c.item.domain} (${c.item.domainPrice?.toFixed(2)}/yr)</p>
                    )}
                    <div className="mt-2 text-sm font-bold text-[#000f22]">${c.total}/{c.period}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { setCurrentPage('templates'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-[#c4c6ce] hover:border-[#00D1FF] hover:bg-[#00D1FF]/5 text-sm text-[#74777e] hover:text-[#00D1FF] font-medium transition-all">
              + Add Another Template
            </button>
          </div>

          {/* Payment Method + Form */}
          <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
            <h2 className="font-bold text-[#000f22] mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Payment Method
            </h2>

            {/* Method selector */}
            <div className="space-y-3 mb-6">
              {methods.map((method) => (
                <button key={method.id} onClick={() => { setPaymentMethod(method.id); setPaymentError(null) }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${effectiveMethod === method.id ? 'border-[#00D1FF] bg-[#00D1FF]/5 ring-1 ring-[#00D1FF]/30' : 'border-[#e6ebf1] hover:border-[#c4c6ce]'}`}>
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${effectiveMethod === method.id ? 'text-[#000f22]' : 'text-[#43474d]'}`}>{method.label}</span>
                    <p className="text-xs text-[#74777e] mt-0.5">{method.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${effectiveMethod === method.id ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-[#c4c6ce]'}`}>
                    {effectiveMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment details form */}
            {effectiveMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-[#4F5B76]">Card Number</Label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber || ''}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: formatCardNumber(e.target.value) })}
                    className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                    disabled={processing}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#4F5B76]">Cardholder Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={paymentDetails.cardName || ''}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                    className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                    disabled={processing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-[#4F5B76]">Expiry (MM/YY)</Label>
                    <Input
                      type="text"
                      placeholder="12/27"
                      maxLength={5}
                      value={paymentDetails.cardExpiry || ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
                        setPaymentDetails({ ...paymentDetails, cardExpiry: val })
                      }}
                      className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#4F5B76]">CVV</Label>
                    <Input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={paymentDetails.cardCvv || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                      disabled={processing}
                    />
                  </div>
                </div>
              </div>
            )}

            {effectiveMethod === 'paypal' && (
              <div>
                <Label className="text-xs text-[#4F5B76]">PayPal Email</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={paymentDetails.paypalEmail || ''}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paypalEmail: e.target.value })}
                  className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                  disabled={processing}
                />
                <p className="text-[10px] text-[#74777e] mt-2">You'll be redirected to PayPal to complete your payment.</p>
              </div>
            )}

            {effectiveMethod === 'bank' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-[#4F5B76]">Bank Name</Label>
                  <Input
                    type="text"
                    placeholder="Bank of America"
                    value={paymentDetails.bankName || ''}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                    className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                    disabled={processing}
                  />
                </div>
                <div>
                  <Label className="text-xs text-[#4F5B76]">Account Number</Label>
                  <Input
                    type="text"
                    placeholder="123456789"
                    value={paymentDetails.bankAccount || ''}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, bankAccount: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    className="mt-1 h-10 border-[#e6ebf1] focus:border-[#00D1FF]"
                    disabled={processing}
                  />
                </div>
                <p className="text-[10px] text-[#74777e]">Bank transfer may take 2-3 business days to process.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary (2 cols) */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] rounded-2xl p-6 text-white sticky top-20">
            <h3 className="font-bold text-lg mb-5">Order Summary</h3>

            <div className="space-y-4 mb-5 pb-5 border-b border-[#768dad]/20">
              {itemCalcs.map((c, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3 pb-2">
                    <img src={c.item.templateImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.item.templateTitle}</p>
                      <p className="text-xs text-[#768dad]">{c.planType === 'store' ? '🛍️ Store' : 'Regular'} · {c.billing}</p>
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

            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[#768dad] text-sm">Grand Total</span>
              <div className="text-right">
                <span className="text-3xl font-bold">${grandTotal}</span>
                <span className="text-[#768dad] text-sm">/{itemCalcs[0]?.period || 'mo'}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4 mt-4">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                <LayoutDashboard className="h-4 w-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#10B981]"><span className="font-semibold">Control Panel Included</span></p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/20">
                <Clock className="h-4 w-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#67e8f9]"><span className="font-semibold">Delivery: 5-7 Business Days</span></p>
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={processing}
              className={`w-full h-12 font-semibold text-base transition-colors ${planType === 'store' ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white' : 'bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22]'}`}
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${grandTotal}
                </>
              )}
            </Button>

            {!user && <p className="text-[10px] text-[#768dad] text-center mt-2">You'll need to sign in to complete your purchase</p>}
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
