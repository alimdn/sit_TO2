'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { toast } from 'sonner'

interface SocialLink {
  id: string
  platform: string
  url: string
  active: boolean
  order: number
}

const platforms = [
  { value: 'facebook', label: 'Facebook', icon: <Facebook className="h-5 w-5" /> },
  { value: 'twitter', label: 'Twitter/X', icon: <Twitter className="h-5 w-5" /> },
  { value: 'instagram', label: 'Instagram', icon: <Instagram className="h-5 w-5" /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="h-5 w-5" /> },
  { value: 'youtube', label: 'YouTube', icon: <Youtube className="h-5 w-5" /> },
]

export default function AdminSocial() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SocialLink | null>(null)
  const [form, setForm] = useState({ platform: 'facebook', url: '', active: true, order: 0 })

  const fetchLinks = () => {
    fetch('/api/social')
      .then(r => r.json())
      .then(setLinks)
      .catch((e) => console.error('[AdminSocial] fetch error:', e))
  }

  useEffect(() => { fetchLinks() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ platform: 'facebook', url: '', active: true, order: links.length + 1 })
    setDialogOpen(true)
  }

  const openEdit = (l: SocialLink) => {
    setEditing(l)
    setForm({ platform: l.platform, url: l.url, active: l.active, order: l.order })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const url = editing ? `/api/social/${editing.id}` : '/api/social'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editing ? 'Link updated' : 'Link created')
        setDialogOpen(false)
        fetchLinks()
      }
    } catch {
      toast.error('Failed to save link')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/social/${id}`, { method: 'DELETE' })
      toast.success('Link deleted')
      fetchLinks()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#000f22]">Social Links</h2>
        <Button onClick={openCreate} className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9">
          <Plus className="h-4 w-4 mr-2" /> Add Link
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => {
          const platform = platforms.find(p => p.value === link.platform)
          return (
            <Card key={link.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#000f22]/5 flex items-center justify-center text-[#000f22]">
                      {platform?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#000f22]">{platform?.label}</p>
                      <Badge className={link.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#74777e]/10 text-[#74777e]'}>
                        {link.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(link)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)} className="text-[#ba1a1a]">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-[#4F5B76] truncate">{link.url}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="grid grid-cols-5 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, platform: p.value })}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                      form.platform === p.value ? 'bg-[#000f22] text-white' : 'bg-[#f1f4f7] text-[#43474d]'
                    }`}
                  >
                    {p.icon}
                    <span className="text-[10px]">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
              {editing ? 'Update Link' : 'Add Link'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
