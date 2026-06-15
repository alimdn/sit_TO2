'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, ShoppingBag, CreditCard, MessageSquare, TrendingUp, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Stats {
  users: number
  orders: number
  subscriptions: number
  revenue: number
  tickets: number
  messages: number
}

export default function AdminSettings() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})

    fetch('/api/settings')
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch(() => {})
  }, [])

  const handleSaveSetting = async (key: string) => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
      })
      toast.success('Setting saved')
    } catch {
      toast.error('Failed to save setting')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">Settings & Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#00D1FF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">{stats?.users || 0}</p>
              <p className="text-xs text-[#4F5B76]">Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">{stats?.orders || 0}</p>
              <p className="text-xs text-[#4F5B76]">Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFB800]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">{stats?.subscriptions || 0}</p>
              <p className="text-xs text-[#4F5B76]">Subscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#000f22]/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#000f22]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">${stats?.revenue || 0}</p>
              <p className="text-xs text-[#4F5B76]">Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#768dad]/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[#768dad]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">{stats?.tickets || 0}</p>
              <p className="text-xs text-[#4F5B76]">Support Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#000f22]">{stats?.messages || 0}</p>
              <p className="text-xs text-[#4F5B76]">Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['site_name', 'site_description', 'contact_email', 'support_phone'].map((key) => (
            <div key={key} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                <Input
                  value={settings[key] || ''}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  className="bg-[#f7fafd]"
                />
              </div>
              <Button onClick={() => handleSaveSetting(key)} size="sm" className="bg-[#000f22] hover:bg-[#0A2540] text-white mb-0.5">
                Save
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
