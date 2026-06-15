'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Copy, Check, FileText, Globe, MessageSquare, Sparkles, Plus, Trash2, Edit3, Save } from 'lucide-react'

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

interface Milestone {
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  date?: string
}

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
  domain: string | null
  domainPrice: number | null
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [copied, setCopied] = useState(false)

  // Work management state
  const [editMilestones, setEditMilestones] = useState<Milestone[]>([])
  const [newMilestoneName, setNewMilestoneName] = useState('')
  const [editProgress, setEditProgress] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {})
  }

  useEffect(() => { fetchOrders() }, [])

  const openOrderDetail = (order: Order) => {
    setSelected(order)
    setStatusUpdate(order.status)
    const milestones = parseMilestones(order.milestones)
    setEditMilestones(milestones)
    setEditProgress(order.progress)
    setEditNotes(order.notes || '')
    setIsEditing(false)
  }

  const parseJSON = (str: string | null): string[] => {
    if (!str) return []
    try { return JSON.parse(str) } catch { return [] }
  }

  const parseMilestones = (str: string): Milestone[] => {
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'object') return parsed
      }
      // Convert simple string array to Milestone objects
      return parsed.map((name: string, i: number) => ({
        name,
        status: i === 0 ? 'completed' as const : 'pending' as const,
      }))
    } catch {
      return [
        { name: 'Order Placed', status: 'completed' },
        { name: 'Design Phase', status: 'pending' },
        { name: 'Review', status: 'pending' },
        { name: 'Development', status: 'pending' },
        { name: 'Delivery', status: 'pending' },
      ]
    }
  }

  const addMilestone = () => {
    if (!newMilestoneName.trim()) return
    setEditMilestones(prev => [...prev, { name: newMilestoneName.trim(), status: 'pending' }])
    setNewMilestoneName('')
  }

  const removeMilestone = (index: number) => {
    setEditMilestones(prev => prev.filter((_, i) => i !== index))
  }

  const toggleMilestoneStatus = (index: number) => {
    setEditMilestones(prev => prev.map((m, i) => {
      if (i !== index) return m
      const next: Record<string, Milestone['status']> = {
        completed: 'in_progress',
        in_progress: 'pending',
        pending: 'completed',
      }
      return { ...m, status: next[m.status] }
    }))
  }

  const handleSaveWork = async () => {
    if (!selected) return
    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusUpdate,
          progress: editProgress,
          milestones: JSON.stringify(editMilestones),
          notes: editNotes || null,
        }),
      })
      if (res.ok) {
        toast.success('Order updated successfully')
        setIsEditing(false)
        fetchOrders()
        // Refresh selected order data
        const updated = await res.json()
        setSelected(updated)
        setEditMilestones(parseMilestones(updated.milestones))
        setEditProgress(updated.progress)
        setEditNotes(updated.notes || '')
      }
    } catch {
      toast.error('Failed to update order')
    }
  }

  const handleStatusOnlyUpdate = async () => {
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

  const generateOrderText = (order: Order): string => {
    const features = parseJSON(order.templateFeatures)
    const addOns = parseJSON(order.addOns)
    const criteria = parseJSON(order.similarSiteCriteria)
    const milestones = parseMilestones(order.milestones)
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

    if (milestones.length > 0) {
      lines.push('── Milestones ──')
      milestones.forEach((m) => {
        const icon = m.status === 'completed' ? '[v]' : m.status === 'in_progress' ? '[>]' : '[ ]'
        lines.push(`  ${icon} ${m.name}${m.date ? ` — ${m.date}` : ''}`)
      })
      lines.push('')
    }

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
        lines.push(`  [+] ${name} (+$3/mo)`)
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

    if (order.domain) {
      lines.push('── Domain ──')
      lines.push(`  Domain: ${order.domain}`)
      lines.push(`  Price: $${order.domainPrice?.toFixed(2) || '0.00'}/yr`)
      const baseIncluded = 50
      const excess = (order.domainPrice || 0) - baseIncluded
      if (excess > 0) {
        const months = Math.ceil(excess / 3)
        lines.push(`  Note: $${baseIncluded} included + $${excess.toFixed(2)} split at $3/mo for ${months} months`)
      } else {
        lines.push('  Note: Included free (under $50)')
      }
      lines.push('')
    }

    if (order.notes) {
      lines.push('── Admin Notes ──')
      lines.push(`  ${order.notes}`)
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#e6ebf1] overflow-hidden">
                          <div className="h-full bg-[#00D1FF] rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                        </div>
                        <span className="text-xs">{order.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#4F5B76]">
                        {features.length} feat{addOns.length > 0 ? ` + ${addOns.length} add` : ''}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#4F5B76]">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
                        Manage
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
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setIsEditing(false) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#4F5B76] text-xs">Customer</span>
                    <p className="font-medium">{selected.user?.name}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76] text-xs">Email</span>
                    <p className="font-medium text-xs">{selected.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76] text-xs">Billing</span>
                    <p className="font-medium capitalize">{selected.billing || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#4F5B76] text-xs">Created</span>
                    <p className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* ─── WORK MANAGEMENT SECTION ─── */}
                <div className="border border-[#e6ebf1] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#f7fafd] border-b border-[#e6ebf1]">
                    <div className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-[#000f22]" />
                      <span className="font-semibold text-sm text-[#000f22]">Work Management</span>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-7 text-xs border-[#00D1FF] text-[#00D1FF] hover:bg-[#00D1FF] hover:text-[#000f22]"
                      >
                        <Edit3 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setIsEditing(false); openOrderDetail(selected) }}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveWork}
                          className="h-7 text-xs bg-[#10B981] hover:bg-[#059669] text-white"
                        >
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Status & Progress */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Status</Label>
                        {isEditing ? (
                          <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                            <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${statusColors[selected.status] || 'bg-gray-100 text-gray-600'} mt-1`}>
                            {selected.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs">Progress</Label>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editProgress}
                              onChange={(e) => setEditProgress(Number(e.target.value))}
                              className="flex-1 h-1.5 accent-[#00D1FF]"
                            />
                            <span className="text-xs font-medium w-8 text-right">{editProgress}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 rounded-full bg-[#e6ebf1] overflow-hidden">
                              <div className="h-full bg-[#00D1FF] rounded-full transition-all" style={{ width: `${selected.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium">{selected.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Milestones */}
                    <div>
                      <Label className="text-xs">Milestones</Label>
                      <div className="mt-1.5 space-y-1.5">
                        {editMilestones.map((ms, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#f7fafd] border border-[#e6ebf1]">
                            <button
                              onClick={() => isEditing && toggleMilestoneStatus(i)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                ms.status === 'completed'
                                  ? 'bg-[#10B981] text-white'
                                  : ms.status === 'in_progress'
                                    ? 'bg-[#00D1FF] text-white'
                                    : 'bg-[#e6ebf1] text-[#74777e]'
                              } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              {ms.status === 'completed' && <Check className="h-3 w-3" />}
                              {ms.status === 'in_progress' && <span className="text-[8px] font-bold">→</span>}
                            </button>
                            <span className={`text-xs flex-1 ${ms.status === 'pending' ? 'text-[#74777e]' : 'text-[#000f22] font-medium'}`}>
                              {ms.name}
                            </span>
                            <Badge className={`text-[9px] px-1.5 py-0 ${
                              ms.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' :
                              ms.status === 'in_progress' ? 'bg-[#00D1FF]/10 text-[#00D1FF]' :
                              'bg-[#e6ebf1] text-[#74777e]'
                            }`}>
                              {ms.status === 'completed' ? 'Done' : ms.status === 'in_progress' ? 'Active' : 'Pending'}
                            </Badge>
                            {isEditing && (
                              <button
                                onClick={() => removeMilestone(i)}
                                className="w-5 h-5 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center"
                              >
                                <Trash2 className="h-3 w-3 text-[#ef4444]" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add new milestone */}
                      {isEditing && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={newMilestoneName}
                            onChange={(e) => setNewMilestoneName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addMilestone()}
                            placeholder="New milestone..."
                            className="h-8 text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addMilestone}
                            disabled={!newMilestoneName.trim()}
                            className="h-8 px-3 border-[#00D1FF] text-[#00D1FF] hover:bg-[#00D1FF] hover:text-[#000f22] text-xs flex-shrink-0"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <Label className="text-xs">Admin Notes</Label>
                      {isEditing ? (
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add notes about this order..."
                          className="mt-1 text-xs min-h-[60px]"
                          rows={3}
                        />
                      ) : (
                        <p className="text-xs text-[#43474d] mt-1 min-h-[20px]">
                          {selected.notes || 'No notes'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features as Copyable Text Block */}
                <div className="bg-[#0A2540] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#768dad]/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00D1FF]" />
                      <span className="text-white text-sm font-semibold">Order Details (Copyable)</span>
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
                  <div className="p-5">
                    <pre className="text-[#c4d6e8] text-xs leading-relaxed whitespace-pre-wrap font-mono select-all">
                      {orderText}
                    </pre>
                  </div>
                </div>

                {/* Visual Feature Tags */}
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

                {/* Domain */}
                {selected.domain && (
                  <div className="p-3 bg-[#FF6B35]/5 rounded-xl border border-[#FF6B35]/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#FF6B35]" />
                      <span className="text-xs font-semibold text-[#000f22]">Domain</span>
                    </div>
                    <p className="text-sm font-bold text-[#FF6B35]">{selected.domain}</p>
                    <p className="text-[10px] text-[#43474d] mt-0.5">
                      ${selected.domainPrice?.toFixed(2) || '0.00'}/yr
                      {selected.domainPrice && selected.domainPrice > 50 && (
                        <> — $50 included + ${(selected.domainPrice - 50).toFixed(2)} split at $3/mo</>
                      )}
                      {selected.domainPrice && selected.domainPrice <= 50 && (
                        <> — Included free</>
                      )}
                    </p>
                  </div>
                )}

                {/* Quick status update (when not editing) */}
                {!isEditing && (
                  <div className="space-y-2 pt-2 border-t border-[#e6ebf1]">
                    <Label className="text-xs">Quick Status Update</Label>
                    <div className="flex gap-2">
                      <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleStatusOnlyUpdate} className="h-9 bg-[#000f22] hover:bg-[#0A2540] text-white text-xs px-4">
                        Update
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
