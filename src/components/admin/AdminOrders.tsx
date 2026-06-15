'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Copy, Check, FileText, Globe, MessageSquare, Sparkles } from 'lucide-react'

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

const SIMILARITY_LABELS: Record<string, { en: string; ar: string }> = {
  layout: { en: 'Layout', ar: 'الشكل' },
  features: { en: 'Features', ar: 'الميزة' },
  colors: { en: 'Colors', ar: 'الألوان' },
  images: { en: 'Image Density', ar: 'كثافة الصور' },
  structure: { en: 'Structure', ar: 'ترتيب الموقع' },
}

const FREE_FEATURES_LIMIT = 5

interface Order {
  id: string
  userId: string
  templateId: string | null
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
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {})
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusUpdate = async () => {
    if (!selected || !statusUpdate) return
    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate }),
      })
      if (res.ok) {
        toast.success('Order status updated')
        setSelected(null)
        fetchOrders()
      }
    } catch {
      toast.error('Failed to update order')
    }
  }

  const parseJSON = (str: string | null): string[] => {
    if (!str) return []
    try { return JSON.parse(str) } catch { return [] }
  }

  const generateOrderText = (order: Order): string => {
    const features = parseJSON(order.templateFeatures)
    const addOns = parseJSON(order.addOns)
    const criteria = parseJSON(order.similarSiteCriteria)
    const lines: string[] = []

    lines.push('═══════════════════════════════════════')
    lines.push(`  ORDER #${order.id.slice(-8)}`)
    lines.push('═══════════════════════════════════════')
    lines.push('')
    lines.push(`Customer:  ${order.user?.name || 'Unknown'}`)
    lines.push(`Email:     ${order.user?.email || 'N/A'}`)
    lines.push(`Date:      ${new Date(order.createdAt).toLocaleString()}`)
    lines.push(`Status:    ${order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
    lines.push(`Billing:   ${order.billing === 'annual' ? 'Annual ($300/yr)' : 'Monthly ($30/mo)'}`)
    lines.push(`Progress:  ${order.progress}%`)
    lines.push('')

    if (features.length > 0) {
      lines.push('── Selected Features ──')
      features.forEach((f, i) => {
        const tag = i < FREE_FEATURES_LIMIT ? '[Free]' : '[+$3]'
        lines.push(`  ${tag} ${f}`)
      })
      const freeCount = Math.min(features.length, FREE_FEATURES_LIMIT)
      const paidCount = Math.max(0, features.length - FREE_FEATURES_LIMIT)
      lines.push(`  Total: ${freeCount} free + ${paidCount} paid = ${features.length} features`)
      lines.push('')
    }

    if (addOns.length > 0) {
      lines.push('── Add-Ons ──')
      addOns.forEach((id) => {
        const name = ADD_ON_NAMES[id] || id
        lines.push(`  [+ ] ${name} (+$3/mo)`)
      })
      lines.push(`  Total: ${addOns.length} add-ons`)
      lines.push('')
    }

    if (order.additionalInfo) {
      lines.push('── Additional Info ──')
      lines.push(`  ${order.additionalInfo}`)
      lines.push('')
    }

    if (order.similarSiteUrl) {
      lines.push('── Similar Website ──')
      lines.push(`  URL: ${order.similarSiteUrl}`)
      if (criteria.length > 0) {
        lines.push(`  Similarity: ${criteria.map(c => {
          const label = SIMILARITY_LABELS[c]
          return label ? `${label.ar} (${label.en})` : c
        }).join(', ')}`)
      }
      lines.push('')
    }

    lines.push('═══════════════════════════════════════')
    return lines.join('\n')
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-[#FFB800]/10 text-[#FFB800]',
    in_progress: 'bg-[#00D1FF]/10 text-[#00D1FF]',
    review: 'bg-[#768dad]/10 text-[#768dad]',
    completed: 'bg-[#10B981]/10 text-[#10B981]',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">Orders Management</h2>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const features = parseJSON(order.templateFeatures)
                const addOns = parseJSON(order.addOns)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">#{order.id.slice(-8)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{order.user?.name || 'Unknown'}</div>
                        <div className="text-xs text-[#4F5B76]">{order.user?.email || ''}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-600'}>
                        {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.progress}%</TableCell>
                    <TableCell>
                      <span className="text-xs text-[#4F5B76]">
                        {features.length} feat{addOns.length > 0 ? ` + ${addOns.length} add` : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#4F5B76]">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelected(order)
                        setStatusUpdate(order.status)
                      }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#4F5B76]">No orders yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#00D1FF]" />
              Order #{selected?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const orderText = generateOrderText(selected)
            const features = parseJSON(selected.templateFeatures)
            const addOns = parseJSON(selected.addOns)
            const criteria = parseJSON(selected.similarSiteCriteria)
            return (
              <div className="space-y-5 mt-4">
                {/* Customer & Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#4F5B76]">Customer:</span>
                    <p className="font-medium">{selected.user?.name}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76]">Email:</span>
                    <p className="font-medium">{selected.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76]">Billing:</span>
                    <p className="font-medium capitalize">{selected.billing || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76]">Created:</span>
                    <p className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Features as Copyable Text Block */}
                <div className="bg-[#0A2540] rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#768dad]/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00D1FF]" />
                      <span className="text-white text-sm font-semibold">Order Details</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(orderText)}
                      className="text-[#768dad] hover:text-white hover:bg-white/10 h-7 px-2.5 text-xs"
                    >
                      {copied ? (
                        <><Check className="h-3.5 w-3.5 mr-1.5 text-[#10B981]" /> Copied!</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy All</>
                      )}
                    </Button>
                  </div>

                  {/* Text content */}
                  <div className="p-5">
                    <pre className="text-[#c4d6e8] text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
                      {orderText}
                    </pre>
                  </div>
                </div>

                {/* Visual Feature Tags (quick overview) */}
                {features.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#4F5B76] mb-2">Features Overview</p>
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

                {/* Add-ons tags */}
                {addOns.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#4F5B76] mb-2">Add-Ons</p>
                    <div className="flex flex-wrap gap-1.5">
                      {addOns.map((id) => (
                        <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20">
                          {ADD_ON_NAMES[id] || id} (+$3/mo)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {selected.additionalInfo && (
                  <div className="p-3 bg-[#f7fafd] rounded-xl border border-[#e6ebf1]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-[#00D1FF]" />
                      <span className="text-xs font-semibold text-[#000f22]">Additional Info</span>
                    </div>
                    <p className="text-sm text-[#43474d] leading-relaxed">{selected.additionalInfo}</p>
                  </div>
                )}

                {/* Similar Website */}
                {selected.similarSiteUrl && (
                  <div className="p-3 bg-[#7C3AED]/5 rounded-xl border border-[#7C3AED]/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#7C3AED]" />
                      <span className="text-xs font-semibold text-[#000f22]">Similar Website</span>
                    </div>
                    <a
                      href={selected.similarSiteUrl.startsWith('http') ? selected.similarSiteUrl : `https://${selected.similarSiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#7C3AED] hover:underline break-all"
                    >
                      {selected.similarSiteUrl}
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

                {/* Notes */}
                {selected.notes && (
                  <div className="p-3 bg-[#f7fafd] rounded-lg">
                    <span className="text-xs text-[#4F5B76]">Notes:</span>
                    <p className="text-sm mt-1">{selected.notes}</p>
                  </div>
                )}

                {/* Update Status */}
                <div className="space-y-2 pt-2 border-t border-[#e6ebf1]">
                  <Label>Update Status</Label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleStatusUpdate} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
                  Update Status
                </Button>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
