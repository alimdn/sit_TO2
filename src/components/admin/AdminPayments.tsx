'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface Gateway {
  id: string
  name: string
  provider: string
  apiKey: string | null
  secretKey: string | null
  active: boolean
  testMode: boolean
}

export default function AdminPayments() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Gateway | null>(null)
  const [form, setForm] = useState({
    name: '',
    provider: 'stripe',
    apiKey: '',
    secretKey: '',
    active: false,
    testMode: true,
  })

  const fetchGateways = () => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(setGateways)
      .catch((e) => console.error('[AdminPayments] fetch error:', e))
  }

  useEffect(() => { fetchGateways() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', provider: 'stripe', apiKey: '', secretKey: '', active: false, testMode: true })
    setDialogOpen(true)
  }

  const openEdit = (g: Gateway) => {
    setEditing(g)
    setForm({
      name: g.name,
      provider: g.provider,
      apiKey: g.apiKey || '',
      secretKey: g.secretKey || '',
      active: g.active,
      testMode: g.testMode,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editing ? `/api/payment-gateways/${editing.id}` : '/api/payment-gateways'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editing ? 'Gateway updated' : 'Gateway created')
        setDialogOpen(false)
        fetchGateways()
      }
    } catch {
      toast.error('Failed to save gateway')
    }
  }

  const providerIcons: Record<string, string> = {
    stripe: '💳',
    paypal: '🅿️',
    bank: '🏦',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#000f22]">Payment Gateways</h2>
        <Button onClick={openCreate} className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9">
          <Plus className="h-4 w-4 mr-2" /> Add Gateway
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{providerIcons[gateway.provider] || '💳'}</span>
                  <CardTitle className="text-base">{gateway.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={gateway.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#74777e]/10 text-[#74777e]'}>
                    {gateway.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {gateway.testMode && (
                  <Badge variant="outline" className="text-xs border-[#FFB800] text-[#FFB800]">Test Mode</Badge>
                )}
                {gateway.apiKey && (
                  <p className="text-xs text-[#4F5B76]">Key: {gateway.apiKey.slice(0, 10)}...</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(gateway)} className="w-full border-[#e6ebf1]">
                <Pencil className="h-4 w-4 mr-2" /> Configure
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Gateway' : 'Add Gateway'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <div className="flex gap-2">
                  {['stripe', 'paypal', 'bank'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, provider: p })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${
                        form.provider === p ? 'bg-[#000f22] text-white' : 'bg-[#f1f4f7] text-[#43474d]'
                      }`}
                    >
                      {p === 'bank' ? 'Bank' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="pk_..." />
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <Input value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} type="password" placeholder="sk_..." />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.testMode} onCheckedChange={(v) => setForm({ ...form, testMode: v })} />
                <Label>Test Mode</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
              {editing ? 'Update Gateway' : 'Add Gateway'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
