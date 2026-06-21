'use client'

import { Star, MessageSquarePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string | null
  content: string
  rating: number
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [form, setForm] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
  })

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => {})
  }, [])

  const colors = ['#00D1FF', '#10B981', '#0A2540', '#768dad']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim() || !form.content.trim()) {
      toast.error('Please fill in your name, role, and review.')
      return
    }
    if (form.content.trim().length < 20) {
      toast.error('Please write at least 20 characters in your review.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          company: form.company.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success('Thank you! Your review has been submitted and will appear after admin approval.')
        setForm({ name: '', role: '', company: '', content: '', rating: 5 })
        setDialogOpen(false)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Failed to submit review. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            What Our Clients Say
          </h2>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Read what our customers say about their experience with WebForge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="p-6 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-[#c4c6ce]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[#43474d] text-sm leading-relaxed mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#e6ebf1]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: colors[index % colors.length] }}
                >
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-sm text-[#000f22]">{testimonial.name}</div>
                  <div className="text-xs text-[#4F5B76]">
                    {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write a review CTA */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outline"
            className="bg-[#000f22] hover:bg-[#0A2540] text-white border-[#000f22] hover:border-[#0A2540] h-11 px-7"
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
          <p className="mt-3 text-xs text-[#74777e]">
            Share your experience — reviews are published after admin approval.
          </p>
        </div>
      </div>

      {/* Review submission dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with WebForge. Your review will be published after admin approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setForm({ ...form, rating: n })}
                    className="p-0.5 transition-transform hover:scale-110"
                    aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        n <= (hoverRating || form.rating)
                          ? 'fill-[#FFB800] text-[#FFB800]'
                          : 'text-[#c4c6ce]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-[#43474d]">
                  {form.rating} / 5
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="t-name">Your Name *</Label>
                <Input
                  id="t-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-role">Role / Title *</Label>
                <Input
                  id="t-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="CEO, Marketing Director, etc."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-company">Company (optional)</Label>
              <Input
                id="t-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-content">Your Review * <span className="text-xs text-[#74777e]">(min 20 chars)</span></Label>
              <Textarea
                id="t-content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tell us about your experience with WebForge..."
                rows={5}
                required
              />
              <p className="text-xs text-[#74777e] text-right">{form.content.length} characters</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-[#e6ebf1]"
              >
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#000f22] hover:bg-[#0A2540] text-white"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
