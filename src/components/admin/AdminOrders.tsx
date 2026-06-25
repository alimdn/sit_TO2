'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Copy, Check, FileText, Globe, MessageSquare, Sparkles, Plus, Trash2, Edit3, Save, RefreshCw, Image as ImageIcon } from 'lucide-react'

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
const STORE_FREE_FEATURES_LIMIT = 10

function isStorePlan(billing: string | null): boolean {
  return billing === 'store' || billing === 'store_semi_annual' || billing === 'store_annual'
}

// Default work-management milestones for every new order.
// 7 stages reflecting the real project lifecycle.
// Each stage has a target progress percentage. Stage 6 (Final Preview)
// does NOT increase progress — it stays at 83% until the customer
// approves, then stage 7 jumps to 100%.
const DEFAULT_MILESTONES: Milestone[] = [
  { name: 'Order Confirmed',           status: 'completed', date: new Date().toISOString() },
  { name: 'Design Phase',              status: 'pending' },
  { name: 'Customer Review',           status: 'pending' },
  { name: 'Development & Integration', status: 'pending' },
  { name: 'Testing & QA',              status: 'pending' },
  { name: 'Final Preview',             status: 'pending' },
  { name: 'Deployment & Delivery',     status: 'pending' },
]

// Progress mapping: which percentage each milestone completion sets.
// Stage 6 (Final Preview) keeps progress at 83% — it's a checkpoint,
// not a progress increase. Stage 7 (Deployment) jumps to 100%.
const MILESTONE_PROGRESS: number[] = [17, 33, 50, 67, 83, 83, 100]

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
  logoUrl?: string | null
  uploadedImages?: string | null  // JSON string of {url, comment}[]
  startDate?: string | null
  deliveryDate?: string | null
  isDemo?: boolean
  createdAt: string
  user: { name: string; email: string }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Work management state
  const [editMilestones, setEditMilestones] = useState<Milestone[]>([])
  const [newMilestoneName, setNewMilestoneName] = useState('')
  const [editProgress, setEditProgress] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const fetchOrders = () => {
    fetch('/api/orders', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
      })
      .catch((e) => console.error('[AdminOrders] fetch error:', e))
  }

  useEffect(() => { fetchOrders() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
    setTimeout(() => setRefreshing(false), 500)
  }

  // Creates a sample order so the admin can verify the Orders tab works
  // end-to-end (list, view, update status, edit milestones, copy details).
  const handleCreateTestOrder = async () => {
    setCreating(true)
    try {
      const testNames = ['Ahmed Ali', 'Sara Mohamed', 'John Smith', 'Maria Garcia', 'Omar Hassan']
      const testTemplates = ['Business Pro', 'Creative Portfolio', 'ShopFront', 'SaaS Dashboard']
      const randomName = testNames[Math.floor(Math.random() * testNames.length)]
      const randomTemplate = testTemplates[Math.floor(Math.random() * testTemplates.length)]
      const randomDomain = `${randomName.split(' ')[0].toLowerCase()}${Math.floor(Math.random() * 1000)}.com`

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null,
          templateId: null,
          status: 'pending',
          progress: 0,
          milestones: JSON.stringify(DEFAULT_MILESTONES),
          notes: null,
          templateFeatures: JSON.stringify(['Responsive Design', 'SEO Optimized', 'Contact Forms', 'Analytics Integration', 'Multi-page Layout']),
          addOns: JSON.stringify(['seo', 'analytics']),
          billing: 'monthly',
          additionalInfo: 'I want a modern look with blue accents.',
          similarSiteUrl: 'https://example.com',
          similarSiteCriteria: JSON.stringify(['layout', 'colors']),
          domain: randomDomain,
          domainPrice: 12.99,
          customerName: randomName,
          customerEmail: `${randomName.split(' ')[0].toLowerCase()}@example.com`,
        }),
      })

      if (res.ok) {
        toast.success(`Test order created for ${randomName} (template: ${randomTemplate})`)
        fetchOrders()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Failed to create test order')
      }
    } catch (e) {
      console.error('Create test order error:', e)
      toast.error('Network error while creating test order')
    } finally {
      setCreating(false)
    }
  }

  // Permanently delete an order — used to clean up test/problematic orders
  // that cannot be completed. Asks for confirmation first.
  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/orders/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Order deleted successfully')
        setDeleteId(null)
        // If the deleted order was open in the detail dialog, close it
        if (selected?.id === deleteId) {
          setSelected(null)
        }
        fetchOrders()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to delete (HTTP ${res.status})`)
      }
    } catch (e) {
      console.error('Delete order error:', e)
      toast.error('Network error while deleting order')
    } finally {
      setDeleting(false)
    }
  }

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
      return DEFAULT_MILESTONES.map(m => ({ ...m }))
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

  // Calculate progress based on completed milestones using the custom
  // MILESTONE_PROGRESS mapping. This handles the special case where
  // stage 6 (Final Preview) does NOT increase progress beyond 83%.
  //
  // Logic: find the LAST completed milestone, then look up its target
  // percentage in MILESTONE_PROGRESS. If no milestones are completed,
  // progress = 0.
  const calcProgressFromMilestones = (milestones: Milestone[]): number => {
    if (milestones.length === 0) return 0
    // Find the index of the last completed milestone
    let lastCompletedIdx = -1
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (milestones[i].status === 'completed') {
        lastCompletedIdx = i
        break
      }
    }
    if (lastCompletedIdx === -1) return 0
    // Use the custom mapping if available, otherwise fall back to linear calc
    if (lastCompletedIdx < MILESTONE_PROGRESS.length) {
      return MILESTONE_PROGRESS[lastCompletedIdx]
    }
    // Fallback: linear calculation
    const completed = milestones.filter(m => m.status === 'completed').length
    return Math.round((completed / milestones.length) * 100)
  }

  // Toggle a milestone's status and IMMEDIATELY persist the change to the API
  // (no need to press "Save" first). Also auto-update the order's progress
  // percentage based on the new milestone states, and auto-set the order
  // status to 'completed' when all milestones are done.
  //
  // IMPORTANT: progress reflects the CURRENT number of completed milestones.
  // If the admin reverts a milestone (clicks it back to pending/in_progress),
  // the progress DECREASES accordingly. This ensures progress always matches
  // the actual state of work.
  //
  // On the FIRST toggle that starts work (status goes from 'pending' to
  // 'in_progress' or 'completed' for the first time), we also stamp:
  //   - startDate: now (ISO timestamp)
  //   - deliveryDate: startDate + 7 days (the deadline for building the site)
  const toggleMilestoneStatus = async (index: number) => {
    if (!selected) return

    // Compute the new milestones array locally first
    const newMilestones = editMilestones.map((m, i) => {
      if (i !== index) return m
      const next: Record<string, Milestone['status']> = {
        completed: 'in_progress',
        in_progress: 'pending',
        pending: 'completed',
      }
      const newStatus = next[m.status]
      // When marking as completed, stamp the date. When reverting, clear it.
      return {
        ...m,
        status: newStatus,
        date: newStatus === 'completed' ? new Date().toISOString() : undefined,
      }
    })

    // Optimistic UI update
    setEditMilestones(newMilestones)

    // Auto-calculate progress from milestones (decreases if reverting)
    const newProgress = calcProgressFromMilestones(newMilestones)
    setEditProgress(newProgress)

    // Auto-set status to 'completed' if all milestones are done,
    // otherwise ensure status isn't 'completed' anymore.
    let newStatus = statusUpdate
    if (newProgress === 100) {
      newStatus = 'completed'
      setStatusUpdate('completed')
    } else if (statusUpdate === 'completed' && newProgress < 100) {
      newStatus = 'in_progress'
      setStatusUpdate('in_progress')
    } else if (newProgress > 0 && statusUpdate === 'pending') {
      // First time work begins — escalate from pending to in_progress
      newStatus = 'in_progress'
      setStatusUpdate('in_progress')
    }

    // Build the update payload. Include startDate + deliveryDate on the
    // first transition into actual work (when they weren't set before).
    const payload: Record<string, unknown> = {
      milestones: JSON.stringify(newMilestones),
      progress: newProgress,
      status: newStatus,
    }

    // If this is the first time progress > 0 and startDate isn't set yet,
    // stamp the start date + 7-day delivery deadline.
    const hasStartedBefore = !!(selected as any).startDate
    if (!hasStartedBefore && newProgress > 0) {
      const now = new Date()
      const delivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 days
      payload.startDate = now.toISOString()
      payload.deliveryDate = delivery.toISOString()
    }

    // Persist immediately to the API
    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        // Refresh the orders list so the table reflects the new progress
        fetchOrders()
        // Update the local selected order + edit state from the response
        setSelected(updated)
        setEditMilestones(parseMilestones(updated.milestones))
        setEditProgress(updated.progress)
        setEditNotes(updated.notes || '')
        const action = newMilestones[index].status === 'completed' ? 'completed' : 'reverted'
        toast.success(`Milestone ${action} — progress: ${newProgress}%`)
      } else {
        toast.error('Failed to save milestone — please try again')
        // Revert on failure
        setEditMilestones(parseMilestones(selected.milestones))
        setEditProgress(selected.progress)
      }
    } catch (e) {
      console.error('Toggle milestone error:', e)
      toast.error('Network error — please try again')
      setEditMilestones(parseMilestones(selected.milestones))
      setEditProgress(selected.progress)
    }
  }

  const getStepDescription = (status: string, progress: number): string => {
    if (status === 'completed') return 'Your website is now live and ready!'
    if (status === 'review') return 'Your website design is ready for review and feedback.'
    if (status === 'in_progress') {
      if (progress < 30) return 'Our team is working on the initial design concepts.'
      if (progress < 60) return 'Design is taking shape — refining layouts and features.'
      if (progress < 90) return 'Development is in progress — building and coding your website.'
      return 'Final touches and quality assurance testing.'
    }
    return 'Your order has been received and is being processed.'
  }

  const handleSaveWork = async () => {
    if (!selected) return

    // Always recalculate progress from milestones when saving, so the
    // admin's manual milestone changes (add/remove/toggle in edit mode)
    // are reflected in the progress percentage. The manual slider value
    // is ignored in favour of the milestone-derived value.
    const recalculatedProgress = calcProgressFromMilestones(editMilestones)
    let effectiveStatus = statusUpdate
    if (recalculatedProgress === 100) {
      effectiveStatus = 'completed'
      setStatusUpdate('completed')
    } else if (recalculatedProgress > 0 && statusUpdate === 'pending') {
      effectiveStatus = 'in_progress'
      setStatusUpdate('in_progress')
    } else if (statusUpdate === 'completed' && recalculatedProgress < 100) {
      effectiveStatus = 'in_progress'
      setStatusUpdate('in_progress')
    }

    // Build payload — include startDate + deliveryDate on first work start
    const payload: Record<string, unknown> = {
      status: effectiveStatus,
      progress: recalculatedProgress,
      milestones: JSON.stringify(editMilestones),
      notes: editNotes || null,
    }
    const hasStartedBefore = !!(selected as any).startDate
    if (!hasStartedBefore && recalculatedProgress > 0) {
      const now = new Date()
      const delivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      payload.startDate = now.toISOString()
      payload.deliveryDate = delivery.toISOString()
    }

    try {
      const res = await fetch(`/api/orders/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(`Order updated — progress: ${recalculatedProgress}%`)
        setIsEditing(false)
        fetchOrders()
        // Refresh selected order data
        const updated = await res.json()
        setSelected(updated)
        setEditMilestones(parseMilestones(updated.milestones))
        setEditProgress(updated.progress)
        setEditNotes(updated.notes || '')

        // Send progress email to customer
        try {
          const currentMilestone = editMilestones.find(m => m.status === 'in_progress') || editMilestones.find(m => m.status === 'completed')
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'progress',
              data: {
                to: selected.user?.email,
                customerName: selected.user?.name || 'Customer',
                orderId: selected.id.slice(-8),
                currentStep: currentMilestone?.name || effectiveStatus.replace('_', ' '),
                stepDescription: getStepDescription(effectiveStatus, recalculatedProgress),
                progress: recalculatedProgress,
                milestones: editMilestones.map(m => ({ name: m.name, status: m.status })),
                siteUrl: `${window.location.origin}`,
              },
            }),
          })
        } catch { /* email failure shouldn't block admin */ }

        // Send delivery email if status is completed
        if (effectiveStatus === 'completed' && selected.user?.email) {
          try {
            const domain = selected.domain || 'yourwebsite.com'
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'delivery',
                data: {
                  to: selected.user.email,
                  customerName: selected.user.name || 'Customer',
                  orderId: selected.id.slice(-8),
                  websiteUrl: `https://${domain}`,
                  domain,
                  controlPanelUrl: `${window.location.origin}`,
                  adminEmail: 'support@webforge.com',
                  billing: selected.billing || 'monthly',
                  monthlyPrice: selected.billing === 'annual' ? 300 : 30,
                },
              }),
            })
          } catch { /* email failure shouldn't block admin */ }
        }
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

        // Send delivery email if status is completed
        if (statusUpdate === 'completed' && selected.user?.email) {
          try {
            const domain = selected.domain || 'yourwebsite.com'
            await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'delivery',
                data: {
                  to: selected.user.email,
                  customerName: selected.user.name || 'Customer',
                  orderId: selected.id.slice(-8),
                  websiteUrl: `https://${domain}`,
                  domain,
                  controlPanelUrl: `${window.location.origin}`,
                  adminEmail: 'support@webforge.com',
                  billing: selected.billing || 'monthly',
                  monthlyPrice: selected.billing === 'annual' ? 300 : 30,
                },
              }),
            })
          } catch { /* email failure shouldn't block admin */ }
        }
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

    if (order.logoUrl) {
      lines.push('── Brand Logo ──')
      lines.push(`  ${order.logoUrl}`)
      lines.push('')
    }

    if (order.uploadedImages) {
      try {
        const imgs = JSON.parse(order.uploadedImages)
        if (Array.isArray(imgs) && imgs.length > 0) {
          lines.push(`── Reference Images (${imgs.length}) ──`)
          imgs.forEach((img: { url: string; comment?: string }, i: number) => {
            lines.push(`  [${i + 1}] ${img.url}`)
            if (img.comment) lines.push(`      Comment: ${img.comment}`)
          })
          lines.push('')
        }
      } catch { /* invalid JSON */ }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#000f22]">Orders Management</h2>
          <p className="text-xs text-[#4F5B76] mt-1 flex items-center gap-3 flex-wrap">
            <span>
              <span className="font-semibold text-[#10B981]">{orders.filter(o => o.status === 'completed').length}</span> completed
              <span className="mx-1">·</span>
              <span className="font-semibold text-[#00D1FF]">{orders.filter(o => o.status === 'in_progress').length}</span> in progress
              <span className="mx-1">·</span>
              <span className="font-semibold text-[#FFB800]">{orders.filter(o => o.status === 'pending').length}</span> pending
              <span className="mx-1">·</span>
              <span>{orders.length} total</span>
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 border-[#e6ebf1] hover:bg-[#f7fafd]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateTestOrder}
            disabled={creating}
            className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" /> Add Test Order
              </>
            )}
          </Button>
        </div>
      </div>

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
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>#{order.id.slice(-8)}</span>
                        {order.isDemo && (
                          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 text-[8px] font-bold tracking-wider uppercase px-1 py-0">
                            Demo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
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
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openOrderDetail(order)}>
                          Manage
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(order.id)}
                          className="h-8 w-8 p-0 text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                          title="Delete order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            const isStore = isStorePlan(selected.billing)
            const orderFreeLimit = isStore ? STORE_FREE_FEATURES_LIMIT : FREE_FEATURES_LIMIT
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

                    {/* Milestones — clickable at all times (auto-saves on click) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs">Milestones (click to toggle status — auto-saves)</Label>
                        <span className="text-[10px] font-medium text-[#00D1FF]">
                          {editMilestones.filter(m => m.status === 'completed').length}/{editMilestones.length} done
                        </span>
                      </div>
                      <div className="mt-1.5 space-y-1.5">
                        {editMilestones.map((ms, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                              ms.status === 'completed'
                                ? 'bg-[#10B981]/5 border-[#10B981]/30'
                                : ms.status === 'in_progress'
                                  ? 'bg-[#00D1FF]/5 border-[#00D1FF]/30'
                                  : 'bg-[#f7fafd] border-[#e6ebf1]'
                            }`}
                          >
                            <button
                              onClick={() => toggleMilestoneStatus(i)}
                              title={`Click to change status (current: ${ms.status})`}
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer hover:scale-110 ${
                                ms.status === 'completed'
                                  ? 'bg-[#10B981] text-white'
                                  : ms.status === 'in_progress'
                                    ? 'bg-[#00D1FF] text-white'
                                    : 'bg-white border-2 border-[#c4c6ce] text-transparent hover:border-[#10B981]'
                              }`}
                            >
                              {ms.status === 'completed' && <Check className="h-3.5 w-3.5" />}
                              {ms.status === 'in_progress' && <span className="text-[9px] font-bold">→</span>}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs block ${ms.status === 'pending' ? 'text-[#74777e]' : 'text-[#000f22] font-medium'}`}>
                                {ms.name}
                              </span>
                              {ms.date && ms.status === 'completed' && (
                                <span className="text-[9px] text-[#10B981]">
                                  ✓ {new Date(ms.date).toLocaleDateString()} {new Date(ms.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
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

                {/* Brand Logo */}
                {selected.logoUrl && (
                  <div className="p-3 bg-[#10B981]/5 rounded-xl border border-[#10B981]/10">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ImageIcon className="h-3.5 w-3.5 text-[#10B981]" />
                      <span className="text-xs font-semibold text-[#000f22]">Brand Logo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={selected.logoUrl}
                        alt="Brand logo"
                        className="w-20 h-20 object-contain rounded-lg bg-white border border-[#e6ebf1] p-1.5"
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={selected.logoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#10B981] hover:underline break-all font-mono"
                        >
                          {selected.logoUrl}
                        </a>
                        <p className="text-[10px] text-[#74777e] mt-1">Click image URL to open full size</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference Images with comments */}
                {(() => {
                  let imgs: { url: string; comment?: string }[] = []
                  try {
                    const parsed = selected.uploadedImages ? JSON.parse(selected.uploadedImages) : []
                    if (Array.isArray(parsed)) imgs = parsed
                  } catch { /* invalid JSON */ }
                  if (imgs.length === 0) return null
                  return (
                    <div className="p-3 bg-[#10B981]/5 rounded-xl border border-[#10B981]/10">
                      <div className="flex items-center gap-1.5 mb-2">
                        <ImageIcon className="h-3.5 w-3.5 text-[#10B981]" />
                        <span className="text-xs font-semibold text-[#000f22]">Reference Images ({imgs.length})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {imgs.map((img, i) => (
                          <div key={i} className="rounded-lg overflow-hidden border border-[#e6ebf1] bg-white">
                            <a href={img.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square bg-[#f7fafd]">
                              <img src={img.url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 left-1 bg-[#000f22]/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                                #{i + 1}
                              </span>
                            </a>
                            {img.comment && (
                              <p className="px-2 py-1.5 text-[11px] text-[#43474d] leading-snug border-t border-[#e6ebf1] bg-[#f7fafd]">
                                {img.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !deleting && !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this order? This action cannot be undone.
              The order will be removed from both the admin panel and the customer&apos;s dashboard immediately.
              Use this only for test orders or orders that cannot be completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-[#ba1a1a] hover:bg-[#991515]"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : 'Delete Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
