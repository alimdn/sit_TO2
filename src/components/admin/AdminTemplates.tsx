'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string
  industries: string
  featured: boolean
  active: boolean
  previewUrl?: string
  livePreview?: string
}

const categories = ['Education', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'SaaS']

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Template | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Business',
    image: '',
    features: '',
    industries: '',
    previewUrl: '',
    livePreview: '',
    featured: false,
    active: true,
  })

  const fetchTemplates = () => {
    fetch('/api/templates')
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => {})
  }

  useEffect(() => { fetchTemplates() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', category: 'Business', image: '', features: '', industries: '', previewUrl: '', livePreview: '', featured: false, active: true })
    setDialogOpen(true)
  }

  const openEdit = (t: Template) => {
    setEditing(t)
    setForm({
      title: t.title,
      description: t.description,
      category: t.category,
      image: t.image,
      features: Array.isArray(JSON.parse(t.features)) ? (JSON.parse(t.features) as string[]).join(', ') : '',
      industries: Array.isArray(JSON.parse(t.industries)) ? (JSON.parse(t.industries) as string[]).join(', ') : '',
      previewUrl: (t as any).previewUrl || '',
      livePreview: (t as any).livePreview || '',
      featured: t.featured,
      active: t.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    const payload = {
      ...form,
      features: JSON.stringify(form.features.split(',').map(f => f.trim()).filter(Boolean)),
      industries: JSON.stringify(form.industries.split(',').map(i => i.trim()).filter(Boolean)),
    }

    try {
      const url = editing ? `/api/templates/${editing.id}` : '/api/templates'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editing ? 'Template updated' : 'Template created')
        setDialogOpen(false)
        fetchTemplates()
      }
    } catch {
      toast.error('Failed to save template')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/templates/${deleteId}`, { method: 'DELETE' })
      toast.success('Template deleted')
      setDeleteId(null)
      fetchTemplates()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#000f22]">Templates Management</h2>
        <Button onClick={openCreate} className="bg-[#000f22] hover:bg-[#0A2540] text-white h-9">
          <Plus className="h-4 w-4 mr-2" /> Add Template
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <img src={t.image} alt={t.title} className="w-16 h-10 object-cover rounded" />
                  </TableCell>
                  <TableCell className="font-medium text-[#000f22]">{t.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{t.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={t.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#74777e]/10 text-[#74777e]'}>
                      {t.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(t.id)} className="text-[#ba1a1a]">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'Add Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (comma-separated)</Label>
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1, Feature 2, ..." />
            </div>
            <div className="space-y-2">
              <Label>Industries (comma-separated)</Label>
              <Input value={form.industries} onChange={(e) => setForm({ ...form, industries: e.target.value })} placeholder="Industry 1, Industry 2, ..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preview URL</Label>
                <Input value={form.previewUrl} onChange={(e) => setForm({ ...form, previewUrl: e.target.value })} placeholder="/templates/your-template.html" />
              </div>
              <div className="space-y-2">
                <Label>Live Preview URL</Label>
                <Input value={form.livePreview} onChange={(e) => setForm({ ...form, livePreview: e.target.value })} placeholder="/templates/your-template.html" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white">
              {editing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this template? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#ba1a1a] hover:bg-[#991515]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
