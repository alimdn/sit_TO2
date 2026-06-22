'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Pencil, Star, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string
  popular: boolean
  active: boolean
}

const intervalLabel = (interval: string): string => {
  if (interval === 'monthly') return 'mo'
  if (interval === 'semi_annual') return '6mo'
  if (interval === 'annual') return 'yr'
  return interval
}

const intervalFullLabel = (interval: string): string => {
  if (interval === 'monthly') return 'Monthly'
  if (interval === 'semi_annual') return 'Semi-Annual'
  if (interval === 'annual') return 'Annual'
  return interval
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    interval: 'monthly',
    features: '',
    popular: false,
    active: true,
  })

  const fetchPlans = () => {
    // Use the /admin endpoint which returns ALL plans (active + inactive).
    fetch('/api/plans/admin', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setPlans(data)
      })
      .catch(() => {})
  }

  useEffect(() => { fetchPlans() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPlans()
    setTimeout(() => setRefreshing(false), 500)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', price: 0, interval: 'monthly', features: '', popular: false, active: true })
    setDialogOpen(true)
  }

  const openEdit = (p: Plan) => {
    setEditing(p)
    let parsedFeatures = ''
    try {
      const f = JSON.parse(p.features)
      if (Array.isArray(f)) parsedFeatures = f.join('\n')
    } catch { /* ignore */ }
    setForm({
      name: p.name,
      price: p.price,
      interval: p.interval,
      features: parsedFeatures,
      popular: p.popular,
      active: p.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    // Validate
    if (!form.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    if (form.price < 0) {
      toast.error('Price cannot be negative')
      return
    }
    if (!['monthly', 'semi_annual', 'annual'].includes(form.interval)) {
      toast.error('Invalid billing interval')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        currency: 'USD',
        interval: form.interval,
        features: JSON.stringify(
          form.features.split('\n').map(f => f.trim()).filter(Boolean)
        ),
        popular: form.popular,
        active: form.active,
      }

      const url = editing ? `/api/plans/${editing.id}` : '/api/plans'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editing ? 'Plan updated successfully' : 'Plan created successfully')
        setDialogOpen(false)
        fetchPlans()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to save (HTTP ${res.status})`)
      }
    } catch (e) {
      console.error('Save error:', e)
      toast.error('Network error while saving plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/plans/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plan deleted successfully')
        setDeleteId(null)
        fetchPlans()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to delete (HTTP ${res.status})`)
      }
    } catch (e) {
      console.error('Delete error:', e)
      toast.error('Network error while deleting plan')
    } finally {
      setDeleting(false)
    }
  }

  // Toggle active state in-place by clicking the status badge
  const toggleActive = async (p: Plan) => {
    setTogglingId(p.id)
    const newActive = !p.active
    // Optimistic update
    setPlans(prev => prev.map(x => x.id === p.id ? { ...x, active: newActive } : x))
    try {
      const res = await fetch(`/api/plans/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      })
      if (res.ok) {
        toast.success(`Plan ${newActive ? 'activated' : 'deactivated'} successfully`)
      } else {
        // Revert on failure
        setPlans(prev => prev.map(x => x.id === p.id ? { ...x, active: !newActive } : x))
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to toggle (HTTP ${res.status})`)
      }
    } catch (e) {
      setPlans(prev => prev.map(x => x.id === p.id ? { ...x, active: !newActive } : x))
      toast.error('Network error while toggling plan status')
    } finally {
      setTogglingId(null)
    }
  }

  const activeCount = plans.filter(p => p.active).length
  const inactiveCount = plans.filter(p => !p.active).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#000f22]">Plans Management</h2>
          <p className="text-xs text-[#4F5B76] mt-1 flex items-center gap-3 flex-wrap">
            <span>
              <span className="font-semibold text-[#10B981]">{activeCount}</span> active
              <span className="mx-1">·</span>
              <span className="font-semibold text-[#74777e]">{inactiveCount}</span> inactive
              <span className="mx-1">·</span>
              <span>{plans.length} total</span>
            </span>
            <span className="text-[#74777e]">
              Changes reflect on the live site (Pricing page, Checkout) immediately.
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
          <Button onClick={openCreate} className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9">
            <Plus className="h-4 w-4 mr-2" /> Add Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#4F5B76]">
            No plans found. Click "Add Plan" to create one.
          </div>
        )}
        {plans.map((plan) => {
          let features: string[] = []
          try {
            const parsed = JSON.parse(plan.features)
            if (Array.isArray(parsed)) features = parsed
          } catch { /* ignore */ }
          return (
            <Card key={plan.id} className={`shadow-card ${plan.popular ? 'ring-2 ring-[#00D1FF]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {plan.name}
                    {plan.popular && (
                      <Badge className="bg-[#00D1FF]/10 text-[#00D1FF]">
                        <Star className="h-3 w-3 mr-1" />Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <button
                    onClick={() => toggleActive(plan)}
                    disabled={togglingId === plan.id}
                    title={plan.active ? 'Click to deactivate — plan will be hidden from the public site but kept here for reactivation' : 'Click to activate — plan will be visible on the public site again'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                      plan.active
                        ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                        : 'bg-[#74777e]/10 text-[#74777e] hover:bg-[#74777e]/20'
                    }`}
                  >
                    {togglingId === plan.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.active ? 'bg-[#10B981]' : 'bg-[#74777e]'}`} />
                        {plan.active ? 'Active' : 'Inactive'}
                      </>
                    )}
                  </button>
                </div>
                <p className="text-2xl font-bold text-[#000f22]">
                  ${plan.price}
                  <span className="text-sm font-normal text-[#4F5B76]">/{intervalLabel(plan.interval)}</span>
                </p>
                <p className="text-xs text-[#74777e]">{intervalFullLabel(plan.interval)} plan</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 mb-4">
                  {features.slice(0, 4).map((f, i) => (
                    <li key={i} className="text-xs text-[#4F5B76]">• {f}</li>
                  ))}
                  {features.length > 4 && <li className="text-xs text-[#74777e]">+{features.length - 4} more</li>}
                  {features.length === 0 && <li className="text-xs text-[#74777e] italic">No features listed</li>}
                </ul>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="flex-1 border-[#e6ebf1]">
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(plan.id)}
                    className="border-[#ef4444]/30 text-[#dc2626] hover:bg-[#ef4444]/5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the plan details below. Changes will be visible on the site immediately.'
                : 'Fill in the details to create a new plan.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name <span className="text-[#ba1a1a]">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Monthly"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <div className="flex gap-2">
                {['monthly', 'semi_annual', 'annual'].map((int) => (
                  <button
                    key={int}
                    onClick={() => setForm({ ...form, interval: int })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.interval === int ? 'bg-[#000f22] text-white' : 'bg-[#f1f4f7] text-[#43474d] hover:bg-[#e5e8eb]'
                    }`}
                  >
                    {intervalFullLabel(int)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                rows={6}
                placeholder={'Professional website design\nResponsive mobile layout\nSSL certificate included'}
              />
              <p className="text-[10px] text-[#74777e]">Each line will be a separate feature bullet.</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
                <Label>Popular <span className="text-[#74777e] text-xs">(highlighted)</span></Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
                className="flex-1 border-[#e6ebf1]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 bg-[#000f22] hover:bg-[#0A2540] text-white"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : editing ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !deleting && !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this plan? This action cannot be undone. The plan will be removed from the live site immediately.
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
              ) : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
