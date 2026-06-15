'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Star } from 'lucide-react'
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

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    interval: 'monthly',
    features: '',
    popular: false,
    active: true,
  })

  const fetchPlans = () => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(setPlans)
      .catch(() => {})
  }

  useEffect(() => { fetchPlans() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', price: 0, interval: 'monthly', features: '', popular: false, active: true })
    setDialogOpen(true)
  }

  const openEdit = (p: Plan) => {
    setEditing(p)
    setForm({
      name: p.name,
      price: p.price,
      interval: p.interval,
      features: Array.isArray(JSON.parse(p.features)) ? (JSON.parse(p.features) as string[]).join('\n') : '',
      popular: p.popular,
      active: p.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      ...form,
      currency: 'USD',
      features: JSON.stringify(form.features.split('\n').map(f => f.trim()).filter(Boolean)),
    }

    try {
      const url = editing ? `/api/plans/${editing.id}` : '/api/plans'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editing ? 'Plan updated' : 'Plan created')
        setDialogOpen(false)
        fetchPlans()
      }
    } catch {
      toast.error('Failed to save plan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#000f22]">Plans Management</h2>
        <Button onClick={openCreate} className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9">
          <Plus className="h-4 w-4 mr-2" /> Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const features: string[] = plan.features ? JSON.parse(plan.features) : []
          return (
            <Card key={plan.id} className={`shadow-card ${plan.popular ? 'ring-2 ring-[#00D1FF]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {plan.popular && <Badge className="bg-[#00D1FF]/10 text-[#00D1FF]"><Star className="h-3 w-3 mr-1" />Popular</Badge>}
                    <Badge className={plan.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#74777e]/10 text-[#74777e]'}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#000f22]">${plan.price}<span className="text-sm font-normal text-[#4F5B76]">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span></p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 mb-4">
                  {features.slice(0, 4).map((f, i) => (
                    <li key={i} className="text-xs text-[#4F5B76]">• {f}</li>
                  ))}
                  {features.length > 4 && <li className="text-xs text-[#74777e]">+{features.length - 4} more</li>}
                </ul>
                <Button variant="outline" size="sm" onClick={() => openEdit(plan)} className="w-full border-[#e6ebf1]">
                  <Pencil className="h-4 w-4 mr-2" /> Edit Plan
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Interval</Label>
              <div className="flex gap-2">
                {['monthly', 'annual'].map((int) => (
                  <button
                    key={int}
                    onClick={() => setForm({ ...form, interval: int })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.interval === int ? 'bg-[#000f22] text-white' : 'bg-[#f1f4f7] text-[#43474d]'
                    }`}
                  >
                    {int.charAt(0).toUpperCase() + int.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={6} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.popular} onCheckedChange={(v) => setForm({ ...form, popular: v })} />
                <Label>Popular</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
              {editing ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
