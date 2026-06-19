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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Eye, ExternalLink, RefreshCw, ImageOff } from 'lucide-react'
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
  previewUrl?: string | null
  livePreview?: string | null
}

const categories = ['Education', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'SaaS']

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Template | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
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
    fetch('/api/templates', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTemplates(data)
      })
      .catch(() => {})
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchTemplates()
    setTimeout(() => setRefreshing(false), 500)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', category: 'Business', image: '', features: '', industries: '', previewUrl: '', livePreview: '', featured: false, active: true })
    setDialogOpen(true)
  }

  const openEdit = (t: Template) => {
    setEditing(t)
    let parsedFeatures = ''
    let parsedIndustries = ''
    try {
      const f = JSON.parse(t.features)
      if (Array.isArray(f)) parsedFeatures = f.join(', ')
    } catch { /* ignore */ }
    try {
      const i = JSON.parse(t.industries)
      if (Array.isArray(i)) parsedIndustries = i.join(', ')
    } catch { /* ignore */ }
    setForm({
      title: t.title,
      description: t.description,
      category: t.category,
      image: t.image,
      features: parsedFeatures,
      industries: parsedIndustries,
      previewUrl: t.previewUrl || '',
      livePreview: t.livePreview || '',
      featured: t.featured,
      active: t.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.image.trim()) {
      toast.error('Image URL is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        image: form.image.trim(),
        features: JSON.stringify(form.features.split(',').map(f => f.trim()).filter(Boolean)),
        industries: JSON.stringify(form.industries.split(',').map(i => i.trim()).filter(Boolean)),
        previewUrl: form.previewUrl.trim() || null,
        livePreview: form.livePreview.trim() || null,
        featured: form.featured,
        active: form.active,
      }

      const url = editing ? `/api/templates/${editing.id}` : '/api/templates'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editing ? 'Template updated successfully' : 'Template created successfully')
        setDialogOpen(false)
        fetchTemplates()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to save (HTTP ${res.status})`)
      }
    } catch (e) {
      console.error('Save error:', e)
      toast.error('Network error while saving template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/templates/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Template deleted successfully')
        setDeleteId(null)
        fetchTemplates()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to delete (HTTP ${res.status})`)
      }
    } catch (e) {
      console.error('Delete error:', e)
      toast.error('Network error while deleting template')
    } finally {
      setDeleting(false)
    }
  }

  const openPreview = (t: Template) => {
    setPreviewTemplate(t)
  }

  const openLivePreview = (t: Template) => {
    const url = t.livePreview || t.previewUrl
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('No live preview URL configured for this template')
    }
  }

  // Toggle the active state of a template in-place by clicking the status badge.
  // Sends a PUT request with only the `active` field so the rest of the template
  // is preserved (the API merges with the existing record).
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const toggleActive = async (t: Template) => {
    setTogglingId(t.id)
    const newActive = !t.active
    // Optimistically update the UI
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, active: newActive } : x))
    try {
      const res = await fetch(`/api/templates/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      })
      if (res.ok) {
        toast.success(`Template ${newActive ? 'activated' : 'deactivated'} successfully`)
      } else {
        // Revert on failure
        setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, active: !newActive } : x))
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || `Failed to toggle (HTTP ${res.status})`)
      }
    } catch (e) {
      // Revert on network error
      setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, active: !newActive } : x))
      toast.error('Network error while toggling template status')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#000f22]">Templates Management</h2>
          <p className="text-xs text-[#4F5B76] mt-1">
            {templates.length} templates · Changes are saved to Vercel Blob and reflect on the site immediately.
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
            <Plus className="h-4 w-4 mr-2" /> Add Template
          </Button>
        </div>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[#4F5B76]">
                    No templates found. Click "Add Template" to create one.
                  </TableCell>
                </TableRow>
              )}
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.title}
                        className="w-16 h-10 object-cover rounded border border-[#e6ebf1]"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-16 h-10 rounded bg-[#f1f4f7] flex items-center justify-center">
                        <ImageOff className="h-4 w-4 text-[#74777e]" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-[#000f22]">{t.title}</div>
                      {t.featured && (
                        <span className="text-[10px] text-[#00D1FF] font-semibold">★ Featured</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{t.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleActive(t)}
                      disabled={togglingId === t.id}
                      title={t.active ? 'Click to deactivate (hide from public site)' : 'Click to activate (show on public site)'}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                        t.active
                          ? 'bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                          : 'bg-[#74777e]/10 text-[#74777e] hover:bg-[#74777e]/20'
                      }`}
                    >
                      {togglingId === t.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span className={`w-1.5 h-1.5 rounded-full ${t.active ? 'bg-[#10B981]' : 'bg-[#74777e]'}`} />
                          {t.active ? 'Active' : 'Inactive'}
                        </>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview button — opens the in-app preview dialog */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(t)}
                        className="h-8 w-8 p-0 text-[#00D1FF] hover:bg-[#00D1FF]/10"
                        title="Preview template details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {/* Live preview — opens livePreview/previewUrl in new tab */}
                      {(t.livePreview || t.previewUrl) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openLivePreview(t)}
                          className="h-8 w-8 p-0 text-[#10B981] hover:bg-[#10B981]/10"
                          title="Open live preview in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(t)}
                        className="h-8 w-8 p-0 text-[#43474d] hover:bg-[#f1f4f7]"
                        title="Edit template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(t.id)}
                        className="h-8 w-8 p-0 text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                        title="Delete template"
                      >
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
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'Add Template'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the template details below. Changes will be visible on the site immediately.'
                : 'Fill in the details to create a new template.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title <span className="text-[#ba1a1a]">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Business Pro"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Short description of the template..."
              />
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
                <Label>Image URL <span className="text-[#ba1a1a]">*</span></Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="/images/template-xyz.png"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (comma-separated)</Label>
              <Input
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Feature 1, Feature 2, ..."
              />
            </div>
            <div className="space-y-2">
              <Label>Industries (comma-separated)</Label>
              <Input
                value={form.industries}
                onChange={(e) => setForm({ ...form, industries: e.target.value })}
                placeholder="Industry 1, Industry 2, ..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preview URL</Label>
                <Input
                  value={form.previewUrl}
                  onChange={(e) => setForm({ ...form, previewUrl: e.target.value })}
                  placeholder="/templates/your-template.html"
                />
              </div>
              <div className="space-y-2">
                <Label>Live Preview URL</Label>
                <Input
                  value={form.livePreview}
                  onChange={(e) => setForm({ ...form, livePreview: e.target.value })}
                  placeholder="/templates/your-template.html"
                />
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
                disabled={saving || !form.title.trim() || !form.image.trim()}
                className="flex-1 bg-[#000f22] hover:bg-[#0A2540] text-white"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : editing ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#00D1FF]" />
              {previewTemplate?.title}
            </DialogTitle>
            <DialogDescription>
              Template preview · ID: <code className="text-[10px] bg-[#f1f4f7] px-1.5 py-0.5 rounded">{previewTemplate?.id}</code>
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4 mt-2">
              {/* Image preview */}
              <div className="rounded-xl overflow-hidden border border-[#e6ebf1] bg-[#f7fafd]">
                {previewTemplate.image ? (
                  <img
                    src={previewTemplate.image}
                    alt={previewTemplate.title}
                    className="w-full max-h-72 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-72 text-[#74777e] text-sm"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15V6a2 2 0 0 0-2-2H6L3 7l3 3"/><path d="m9 21 12-12"/></svg></div>'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-72 text-[#74777e]">
                    <ImageOff className="h-12 w-12" />
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">{previewTemplate.category}</Badge>
                {previewTemplate.featured && (
                  <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] text-xs">★ Featured</Badge>
                )}
                <Badge className={previewTemplate.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#74777e]/10 text-[#74777e]'}>
                  {previewTemplate.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-[#4F5B76] uppercase tracking-wide mb-1">Description</h4>
                <p className="text-sm text-[#000f22] leading-relaxed">{previewTemplate.description || '—'}</p>
              </div>

              {/* Features */}
              {(() => {
                let features: string[] = []
                try {
                  const parsed = JSON.parse(previewTemplate.features)
                  if (Array.isArray(parsed)) features = parsed
                } catch { /* ignore */ }
                if (features.length === 0) return null
                return (
                  <div>
                    <h4 className="text-xs font-semibold text-[#4F5B76] uppercase tracking-wide mb-2">Features ({features.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-[#f1f4f7] text-[#43474d]">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Industries */}
              {(() => {
                let industries: string[] = []
                try {
                  const parsed = JSON.parse(previewTemplate.industries)
                  if (Array.isArray(parsed)) industries = parsed
                } catch { /* ignore */ }
                if (industries.length === 0) return null
                return (
                  <div>
                    <h4 className="text-xs font-semibold text-[#4F5B76] uppercase tracking-wide mb-2">Industries ({industries.length})</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {industries.map((ind, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-[#7C3AED]/10 text-[#7C3AED]">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* URLs */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#e6ebf1]">
                <div>
                  <h4 className="text-xs font-semibold text-[#4F5B76] uppercase tracking-wide mb-1">Preview URL</h4>
                  {previewTemplate.previewUrl ? (
                    <a
                      href={previewTemplate.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00D1FF] hover:underline break-all"
                    >
                      {previewTemplate.previewUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-[#74777e]">—</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#4F5B76] uppercase tracking-wide mb-1">Live Preview URL</h4>
                  {previewTemplate.livePreview ? (
                    <a
                      href={previewTemplate.livePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#10B981] hover:underline break-all"
                    >
                      {previewTemplate.livePreview}
                    </a>
                  ) : (
                    <span className="text-xs text-[#74777e]">—</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const t = previewTemplate
                    setPreviewTemplate(null)
                    setTimeout(() => openEdit(t), 100)
                  }}
                  className="flex-1 border-[#e6ebf1]"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {(previewTemplate.livePreview || previewTemplate.previewUrl) && (
                  <Button
                    onClick={() => openLivePreview(previewTemplate)}
                    className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Live
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                  className="border-[#e6ebf1]"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !deleting && !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone. The template will be removed from the live site immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault() // prevent auto-close; we close manually on success
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
              ) : 'Delete Template'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
