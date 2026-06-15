'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LayoutDashboard, Clock, Check, Circle, ArrowRight, MessageSquare, Globe } from 'lucide-react'

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

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/orders?userId=' + user.id).then(r => r.json()),
      fetch('/api/subscriptions?userId=' + user.id).then(r => r.json()),
    ]).then(([ords, subs]) => {
      setOrders(ords)
      const allPayments: Payment[] = []
      subs.forEach((sub: any) => {
        if (sub.payments) {
          allPayments.push(...sub.payments)
        }
      })
      setPayments(allPayments)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

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
      <h2 className="text-2xl font-bold text-[#000f22]">My Orders</h2>

      {orders.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <p className="text-[#4F5B76]">No orders yet. Subscribe to a plan to get started.</p>
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
                    <CardTitle className="text-base">Order #{order.id.slice(-8)}</CardTitle>
                    <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-600'}>
                      {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#4F5B76]">
                    Created {new Date(order.createdAt).toLocaleDateString()} • {order.billing === 'annual' ? 'Annual' : 'Monthly'} Plan
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Steps - Visual Timeline */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#000f22]">Order Progress</h4>
                      <span className="text-xs font-medium text-[#00D1FF]">{order.progress}%</span>
                    </div>

                    {/* Steps */}
                    <div className="relative">
                      {/* Connection line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#e6ebf1]">
                        <div
                          className="h-full bg-[#00D1FF] transition-all duration-500"
                          style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                      </div>

                      <div className="relative flex justify-between">
                        {ORDER_STEPS.map((step, i) => {
                          const isCompleted = i < currentStep
                          const isCurrent = i === currentStep
                          return (
                            <div key={step.key} className="flex flex-col items-center" style={{ width: '20%' }}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                                isCompleted
                                  ? 'bg-[#10B981] border-[#10B981]'
                                  : isCurrent
                                    ? 'bg-[#00D1FF] border-[#00D1FF] ring-4 ring-[#00D1FF]/20'
                                    : 'bg-white border-[#e6ebf1]'
                              }`}>
                                {isCompleted ? (
                                  <Check className="h-4 w-4 text-white" />
                                ) : isCurrent ? (
                                  <ArrowRight className="h-4 w-4 text-white" />
                                ) : (
                                  <Circle className="h-3 w-3 text-[#c4c6ce]" />
                                )}
                              </div>
                              <p className={`text-[10px] mt-1.5 text-center font-medium leading-tight ${
                                isCompleted ? 'text-[#10B981]' : isCurrent ? 'text-[#00D1FF]' : 'text-[#74777e]'
                              }`}>
                                {step.label}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Current step description */}
                    <div className="mt-3 p-2.5 rounded-lg bg-[#f7fafd] border border-[#e6ebf1]">
                      <p className="text-xs text-[#43474d]">
                        <span className="font-semibold">{ORDER_STEPS[currentStep].label}:</span>{' '}
                        {ORDER_STEPS[currentStep].desc}
                      </p>
                    </div>
                  </div>

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
            return (
              <div className="space-y-4 mt-4">
                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#000f22] mb-2">Selected Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((f, i) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          i < FREE_FEATURES_LIMIT
                            ? 'bg-[#f7fafd] text-[#43474d] border-[#e6ebf1]'
                            : 'bg-[#FFF8E1] text-[#92400E] border-[#FFE082]'
                        }`}>
                          {f}{i >= FREE_FEATURES_LIMIT && ' (+$3)'}
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
