'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LayoutDashboard, Clock, Check, Circle, ArrowRight, MessageSquare, Globe, RefreshCw, Plus } from 'lucide-react'

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

// Check if an order is a Store plan (based on billing field)
function isStorePlan(billing: string | null): boolean {
  return billing === 'store' || billing === 'store_semi_annual' || billing === 'store_annual'
}

const SIMILARITY_LABELS: Record<string, { en: string; ar: string }> = {
  layout: { en: 'Layout', ar: 'الشكل' },
  features: { en: 'Features', ar: 'الميزة' },
  colors: { en: 'Colors', ar: 'الألوان' },
  images: { en: 'Image Density', ar: 'كثافة الصور' },
  structure: { en: 'Structure', ar: 'ترتيب الموقع' },
}

interface Order {
  id: string
  status: string
  progress: number
  milestones: string
  notes: string | null
  templateFeatures: string | null
  addOns: string | null
  billing: string | null
  additionalInfo: string | null
  similarSiteUrl: string | null
  similarSiteCriteria: string | null
  domain: string | null
  domainPrice: number | null
  startDate?: string | null
  deliveryDate?: string | null
  isDemo?: boolean
  createdAt: string
  updatedAt: string
  planId: string | null
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  transactionId: string | null
  createdAt: string
}

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Your order has been received and confirmed' },
  { key: 'design', label: 'Design Phase', desc: 'Our team is designing your website' },
  { key: 'review', label: 'Review & Feedback', desc: 'Review the design and provide feedback' },
  { key: 'development', label: 'Development', desc: 'Building and coding your website' },
  { key: 'delivery', label: 'Delivery', desc: 'Your website is ready — control panel access granted!' },
]

// Default milestones shown to the customer when an order has no milestones
// stored yet. Must match DEFAULT_MILESTONES in AdminOrders.tsx (7 stages).
const DEFAULT_CUSTOMER_MILESTONES = [
  { name: 'Order Confirmed',           status: 'completed' as const },
  { name: 'Design Phase',              status: 'pending' as const },
  { name: 'Customer Review',           status: 'pending' as const },
  { name: 'Development & Integration', status: 'pending' as const },
  { name: 'Testing & QA',              status: 'pending' as const },
  { name: 'Final Preview',             status: 'pending' as const },
  { name: 'Deployment & Delivery',     status: 'pending' as const },
]

interface CustomerMilestone {
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  date?: string
}

// Parse the milestones JSON stored on the order. Falls back to the
// default 8-stage lifecycle if parsing fails or the field is empty.
function parseCustomerMilestones(raw: string): CustomerMilestone[] {
  if (!raw) return DEFAULT_CUSTOMER_MILESTONES
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Handle both string[] and {name, status, date?}[] formats
      if (typeof parsed[0] === 'string') {
        return parsed.map((name: string, i: number) => ({
          name,
          status: i === 0 ? 'completed' as const : 'pending' as const,
        }))
      }
      return parsed as CustomerMilestone[]
    }
  } catch { /* ignore */ }
  return DEFAULT_CUSTOMER_MILESTONES
}

function getStepIndex(status: string, progress: number): number {
  if (status === 'completed') return 4
  if (status === 'review') return 2
  if (status === 'in_progress') {
    if (progress < 40) return 1
    if (progress < 70) return 2
    return 3
  }
  return 0
}

export default function OrdersPage() {
  const { user } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = useCallback(() => {
    if (!user) return
    Promise.all([
      fetch('/api/orders?userId=' + user.id, { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/subscriptions?userId=' + user.id, { cache: 'no-store' }).then(r => r.json()),
    ]).then(([ords, subs]) => {
      if (Array.isArray(ords)) setOrders(ords)
      const allPayments: Payment[] = []
      if (Array.isArray(subs)) {
        subs.forEach((sub: any) => {
          if (sub.payments) {
            allPayments.push(...sub.payments)
          }
        })
      }
      setPayments(allPayments)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Auto-refresh every 10 seconds so the customer sees admin milestone
  // updates without needing to manually reload the page.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleManualRefresh = () => {
    setRefreshing(true)
    fetchOrders()
    setTimeout(() => setRefreshing(false), 600)
  }

  // Creates a demo order linked to THIS customer's userId so it appears
  // in their dashboard immediately. Simulates what happens after Checkout.
  const [creatingDemo, setCreatingDemo] = useState(false)
  const handleCreateDemoOrder = async () => {
    if (!user) return
    setCreatingDemo(true)
    try {
      const now = new Date().toISOString()
      const delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          templateId: '1',
          status: 'pending',
          progress: 17,
          isDemo: true,  // ← marks this as a demo order (shows DEMO badge)
          milestones: JSON.stringify([
            { name: 'Order Confirmed',           status: 'completed', date: now },
            { name: 'Design Phase',              status: 'pending' },
            { name: 'Customer Review',           status: 'pending' },
            { name: 'Development & Integration', status: 'pending' },
            { name: 'Testing & QA',              status: 'pending' },
            { name: 'Final Preview',             status: 'pending' },
            { name: 'Deployment & Delivery',     status: 'pending' },
          ]),
          templateFeatures: JSON.stringify(['Responsive Design', 'SEO Optimized', 'Contact Forms', 'Analytics Integration', 'Multi-page Layout']),
          addOns: JSON.stringify(['seo']),
          billing: 'monthly',
          additionalInfo: 'Demo order — created from dashboard for testing.',
          domain: `${user.name?.split(' ')[0]?.toLowerCase() || 'demo'}${Date.now().toString(36).slice(-4)}.com`,
          domainPrice: 12.99,
          customerName: user.name,
          customerEmail: user.email,
          startDate: now,
          deliveryDate: delivery,
        }),
      })
      if (res.ok) {
        toast.success('Demo order created! Watch it appear below.')
        fetchOrders()
      } else {
        toast.error('Failed to create demo order')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setCreatingDemo(false)
    }
  }

  // NOTE: handleCreateDemoOrder sends isDemo: true so the order is
  // clearly marked as a demo/test order. This is NOT a real purchase.

  const statusColors: Record<string, string> = {
    active: 'bg-[#10B981]/10 text-[#10B981]',
    pending: 'bg-[#FFB800]/10 text-[#FFB800]',
    in_progress: 'bg-[#00D1FF]/10 text-[#00D1FF]',
    completed: 'bg-[#10B981]/10 text-[#10B981]',
    review: 'bg-[#768dad]/10 text-[#768dad]',
    failed: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  }

  const parseJSON = (str: string | null): string[] => {
    if (!str) return []
    try { return JSON.parse(str) } catch { return [] }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="h-40 rounded-xl bg-[#f1f4f7] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#000f22]">My Orders</h2>
          <p className="text-xs text-[#4F5B76] mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} · Auto-refreshing every 10s
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="h-9 border-[#e6ebf1] hover:bg-[#f7fafd]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f1f4f7] flex items-center justify-center mx-auto">
              <LayoutDashboard className="h-8 w-8 text-[#74777e]" />
            </div>
            <div>
              <p className="text-[#4F5B76] font-medium">No orders yet</p>
              <p className="text-xs text-[#74777e] mt-1">Subscribe to a plan to get started, or create a demo order to see how it works.</p>
            </div>
            <Button
              onClick={handleCreateDemoOrder}
              disabled={creatingDemo}
              className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-10"
            >
              {creatingDemo ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#000f22] border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Demo Order
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentStep = getStepIndex(order.status, order.progress)
            const features = parseJSON(order.templateFeatures)
            const addOns = parseJSON(order.addOns)
            return (
              <Card key={order.id} className="shadow-card overflow-hidden">
                {/* Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Order #{order.id.slice(-8)}</CardTitle>
                      {order.isDemo && (
                        <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[9px] font-bold tracking-wider uppercase">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-600'}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4F5B76]">
                    Created {new Date(order.createdAt).toLocaleDateString()} • {order.billing === 'annual' || order.billing === 'store_annual' ? 'Annual' : order.billing === 'semi_annual' || order.billing === 'store_semi_annual' ? 'Semi-Annual' : 'Monthly'} Plan
                    {isStorePlan(order.billing) && <span className="text-[#F59E0B] font-medium"> • 🛍️ Store Package</span>}
                    {order.isDemo && <span className="text-[#F59E0B] font-medium"> • Demo order (not a real purchase)</span>}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Steps — Visual Stepper (synced with admin milestones) */}
                  {(() => {
                    const milestones = parseCustomerMilestones(order.milestones)
                    const completedCount = milestones.filter(m => m.status === 'completed').length
                    const totalCount = milestones.length
                    // Find the index of the current step (first non-completed milestone)
                    const currentStepIdx = milestones.findIndex(m => m.status !== 'completed')
                    // If all are completed, currentStepIdx = -1 → use last index
                    const activeIndex = currentStepIdx === -1 ? totalCount - 1 : currentStepIdx
                    // Percentage for the connection line fill
                    const fillPercent = totalCount > 1
                      ? (activeIndex / (totalCount - 1)) * 100
                      : 100

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-[#000f22]">Order Progress</h4>
                          <span className="text-xs font-medium text-[#00D1FF]" translate="no" lang="en">
                            {order.progress}%
                          </span>
                        </div>

                        {/* Horizontal Stepper */}
                        <div className="relative pb-2">
                          {/* Connection line (background) */}
                          <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#e6ebf1] rounded-full" />
                          {/* Connection line (filled — green→cyan gradient for completed steps) */}
                          <div
                            className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-[#10B981] to-[#00D1FF] rounded-full transition-all duration-700"
                            style={{ width: `calc((100% - 40px) * ${fillPercent / 100})` }}
                          />

                          {/* Step circles */}
                          <div className="relative flex justify-between">
                            {milestones.map((m, i) => {
                              const isCompleted = m.status === 'completed'
                              const isCurrent = i === activeIndex && !isCompleted && order.status !== 'completed'
                              const isLastCompleted = order.status === 'completed' && i === totalCount - 1
                              return (
                                <div key={i} className="flex flex-col items-center" style={{ width: `${100 / totalCount}%` }}>
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                                      isCompleted
                                        ? 'bg-[#10B981] border-[#10B981] shadow-md shadow-[#10B981]/30'
                                        : isCurrent
                                          ? 'bg-[#00D1FF] border-[#00D1FF] ring-4 ring-[#00D1FF]/20 animate-pulse'
                                          : isLastCompleted
                                            ? 'bg-[#10B981] border-[#10B981] shadow-md shadow-[#10B981]/30'
                                            : 'bg-white border-[#e6ebf1]'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <Check className="h-5 w-5 text-white" />
                                    ) : isCurrent ? (
                                      <Clock className="h-4 w-4 text-white" />
                                    ) : isLastCompleted ? (
                                      <Check className="h-5 w-5 text-white" />
                                    ) : (
                                      <span className="text-xs font-bold text-[#74777e]">{i + 1}</span>
                                    )}
                                  </div>
                                  <p className={`text-[10px] mt-2 text-center font-medium leading-tight transition-colors ${
                                    isCompleted ? 'text-[#10B981]' : isCurrent ? 'text-[#00D1FF]' : 'text-[#74777e]'
                                  }`}>
                                    {m.name}
                                  </p>
                                  {m.date && isCompleted && (
                                    <p className="text-[8px] text-[#10B981] mt-0.5" translate="no" lang="en">
                                      {new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                  )}
                                  {isCurrent && (
                                    <p className="text-[8px] text-[#00D1FF] mt-0.5">In progress…</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Current step description */}
                        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-[#f7fafd] to-[#00D1FF]/5 border border-[#00D1FF]/20">
                          <div className="flex items-center gap-2">
                            {order.status === 'completed' ? (
                              <>
                                <Check className="h-4 w-4 text-[#10B981] flex-shrink-0" />
                                <p className="text-xs text-[#10B981] font-semibold">
                                  Your website is complete and ready! 🎉
                                </p>
                              </>
                            ) : currentStepIdx >= 0 ? (
                              <>
                                <ArrowRight className="h-4 w-4 text-[#00D1FF] flex-shrink-0" />
                                <p className="text-xs text-[#43474d]">
                                  <span className="font-semibold text-[#00D1FF]">Current step:</span>{' '}
                                  {milestones[currentStepIdx].name}
                                </p>
                              </>
                            ) : (
                              <>
                                <Clock className="h-4 w-4 text-[#00D1FF] flex-shrink-0" />
                                <p className="text-xs text-[#43474d]">Processing…</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Counter dots */}
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <div className="flex gap-1">
                            {milestones.map((m, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  m.status === 'completed' ? 'bg-[#10B981]' : 'bg-[#e6ebf1]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#74777e]" translate="no" lang="en">
                            {completedCount} of {totalCount} steps completed
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Quick info row */}
                  <div className="flex flex-wrap gap-2">
                    {features.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f4f7] text-[#4F5B76]">
                        {features.length} features
                      </span>
                    )}
                    {addOns.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D1FF]/10 text-[#00D1FF]">
                        {addOns.length} add-ons
                      </span>
                    )}
                    {order.additionalInfo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED]">
                        Notes included
                      </span>
                    )}
                    {order.domain && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> {order.domain}
                      </span>
                    )}
                  </div>

                  {/* Delivery & Dashboard notice */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span className="font-medium">Control Panel Included</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">Delivery: 5-7 Business Days</span>
                    </div>
                  </div>

                  {/* View details button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="w-full border-[#e6ebf1] text-[#43474d] hover:bg-[#f7fafd] text-xs"
                  >
                    View Full Details
                  </Button>

                  {/* Notes */}
                  {order.notes && (
                    <p className="text-sm text-[#4F5B76] p-3 bg-[#f7fafd] rounded-lg">{order.notes}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(-8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const features = parseJSON(selectedOrder.templateFeatures)
            const addOns = parseJSON(selectedOrder.addOns)
            const criteria = parseJSON(selectedOrder.similarSiteCriteria)
            const isStore = isStorePlan(selectedOrder.billing)
            const orderFreeLimit = isStore ? STORE_FREE_FEATURES_LIMIT : FREE_FEATURES_LIMIT
            return (
              <div className="space-y-4 mt-4">
                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#000f22] mb-2">Selected Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((f, i) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          i < orderFreeLimit
                            ? 'bg-[#f7fafd] text-[#43474d] border-[#e6ebf1]'
                            : 'bg-[#FFF8E1] text-[#92400E] border-[#FFE082]'
                        }`}>
                          {f}{i >= orderFreeLimit && ' (+$3)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {addOns.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#000f22] mb-2">Add-Ons</p>
                    <div className="flex flex-wrap gap-1.5">
                      {addOns.map((id) => (
                        <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20">
                          {ADD_ON_NAMES[id] || id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {selectedOrder.additionalInfo && (
                  <div className="p-3 bg-[#f7fafd] rounded-xl border border-[#e6ebf1]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="h-3.5 w-3.5 text-[#00D1FF]" />
                      <span className="text-xs font-semibold text-[#000f22]">Additional Info</span>
                    </div>
                    <p className="text-sm text-[#43474d]">{selectedOrder.additionalInfo}</p>
                  </div>
                )}

                {/* Similar Website */}
                {selectedOrder.similarSiteUrl && (
                  <div className="p-3 bg-[#7C3AED]/5 rounded-xl border border-[#7C3AED]/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="h-3.5 w-3.5 text-[#7C3AED]" />
                      <span className="text-xs font-semibold text-[#000f22]">Similar Website</span>
                    </div>
                    <a
                      href={selectedOrder.similarSiteUrl.startsWith('http') ? selectedOrder.similarSiteUrl : `https://${selectedOrder.similarSiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#7C3AED] hover:underline break-all"
                    >
                      {selectedOrder.similarSiteUrl}
                    </a>
                    {criteria.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {criteria.map((c) => {
                          const label = SIMILARITY_LABELS[c]
                          return (
                            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
                              {label ? `${label.ar} (${label.en})` : c}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Domain */}
                {selectedOrder.domain && (
                  <div className="p-3 bg-[#FF6B35]/5 rounded-xl border border-[#FF6B35]/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="h-3.5 w-3.5 text-[#FF6B35]" />
                      <span className="text-xs font-semibold text-[#000f22]">Selected Domain</span>
                    </div>
                    <p className="text-sm font-bold text-[#FF6B35]">{selectedOrder.domain}</p>
                    <div className="text-[10px] text-[#43474d] mt-1">
                      <span>${selectedOrder.domainPrice?.toFixed(2) || '0.00'}/yr</span>
                      {selectedOrder.domainPrice && selectedOrder.domainPrice > 50 ? (
                        <span className="text-[#F59E0B] ml-1">— $50 included + ${(selectedOrder.domainPrice - 50).toFixed(2)} split at $3/mo</span>
                      ) : selectedOrder.domainPrice && selectedOrder.domainPrice <= 50 ? (
                        <span className="text-[#10B981] ml-1">— Included free</span>
                      ) : null}
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="p-3 bg-[#f7fafd] rounded-lg">
                    <span className="text-xs text-[#4F5B76]">Admin Notes:</span>
                    <p className="text-sm mt-1">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Payment history */}
      {payments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId || payment.id.slice(-8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="capitalize">{payment.method}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[payment.status] || 'bg-gray-100 text-gray-600'} variant="secondary">
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#4F5B76]">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
