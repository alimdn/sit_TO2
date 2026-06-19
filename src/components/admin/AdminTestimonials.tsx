'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, X, Pencil, Trash2, Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string | null
  content: string
  rating: number
  active: boolean
  createdAt?: string
}

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
  })

  const fetchAll = () => {
    setLoading(true)
    fetch('/api/testimonials/all')
      .then(r => r.json())
      .then((data: Testimonial[]) => setItems(data))
      .catch(() => toast.error('Failed to load testimonials'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({
      name: t.name,
      role: t.role,
      company: t.company || '',
      content: t.content,
      rating: t.rating,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
  }

  const handleSave = async () => {
    if (!editing) return
    if (!form.name.trim() || !form.role.trim() || !form.content.trim()) {
      toast.error('Name, role, and content are required')
      return
    }
    try {
      const res = await fetch(`/api/testimonials/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          company: form.company || null,
          content: form.content,
          rating: form.rating,
        }),
      })
      if (res.ok) {
        toast.success('Testimonial updated')
        closeDialog()
        fetchAll()
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const toggleActive = async (t: Testimonial) => {
    const newActive = !t.active
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      })
      if (res.ok) {
        toast.success(newActive ? 'Testimonial approved & published' : 'Testimonial unpublished')
        setItems(prev => prev.map(x => x.id === t.id ? { ...x, active: newActive } : x))
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Delete the review from "${t.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/testimonials/${t.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Testimonial deleted')
        setItems(prev => prev.filter(x => x.id !== t.id))
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const filtered = items.filter(t => {
    if (filter === 'pending') return !t.active
    if (filter === 'active') return t.active
    return true
  })

  const pendingCount = items.filter(t => !t.active).length
  const activeCount = items.filter(t => t.active).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#000f22] flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Reviews Management
          </h2>
          <p className="text-sm text-[#4F5B76] mt-1">
            Approve, edit, or delete customer reviews submitted from the homepage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#FFF8E1] text-[#92400E] border border-[#FFE082]">
            {pendingCount} pending
          </Badge>
          <Badge className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            {activeCount} published
          </Badge>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="inline-flex items-center bg-[#f1f4f7] rounded-xl p-1 gap-1">
        {([
          { id: 'all', label: `All (${items.length})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'active', label: `Published (${activeCount})` },
        ] as const).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f.id
                ? 'bg-[#000f22] text-white shadow-md'
                : 'text-[#43474d] hover:text-[#000f22]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-[#74777e]">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-[#c4c6ce] mx-auto mb-3" />
            <p className="text-sm text-[#4F5B76]">No reviews in this view.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => (
            <Card key={t.id} className={`shadow-card ${t.active ? '' : 'ring-2 ring-[#F59E0B]/30'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <Badge className={t.active ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'}>
                        {t.active ? 'Published' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#4F5B76] mt-1">
                      {t.role}{t.company ? ` · ${t.company}` : ''}
                      {t.createdAt && (
                        <> · {new Date(t.createdAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < t.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-[#c4c6ce]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#43474d] italic mb-4 leading-relaxed">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {!t.active ? (
                    <Button
                      size="sm"
                      onClick={() => toggleActive(t)}
                      className="bg-[#10B981] hover:bg-[#059669] text-white h-8"
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Approve & Publish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(t)}
                      className="border-[#e6ebf1] h-8"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Unpublish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(t)}
                    className="border-[#e6ebf1] h-8"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(t)}
                    className="border-[#ef4444]/30 text-[#dc2626] hover:bg-[#ef4444]/5 h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role / Title</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-0.5"
                  >
                    <Star className={`h-6 w-6 ${n <= form.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-[#c4c6ce]'}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-[#43474d]">{form.rating} / 5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} className="bg-[#000f22] hover:bg-[#0A2540] text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
