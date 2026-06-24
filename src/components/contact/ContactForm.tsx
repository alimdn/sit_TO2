'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MapPin, Clock, Send } from 'lucide-react'
import { toast } from 'sonner'

const DEFAULTS = {
  contact_email: 'support@webforge.com',
  contact_address_line1: '',  // Removed fake address — set real one via admin panel
  contact_address_line2: '',
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch((e) => console.error('[ContactForm] fetch error:', e))
  }, [])

  const contactEmail = settings.contact_email || DEFAULTS.contact_email
  // Allow multi-line address (split by \n). If single line, fall back to defaults.
  const rawAddress = settings.contact_address || ''
  let addressLine1 = DEFAULTS.contact_address_line1
  let addressLine2 = DEFAULTS.contact_address_line2
  if (rawAddress) {
    const lines = rawAddress.split(/\n+/).map(l => l.trim()).filter(Boolean)
    if (lines.length >= 2) {
      addressLine1 = lines[0]
      addressLine2 = lines.slice(1).join(', ')
    } else if (lines.length === 1) {
      addressLine1 = lines[0]
      addressLine2 = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.category || !form.message) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setForm({ name: '', email: '', subject: '', category: '', message: '' })
      } else {
        toast.error('Failed to send message. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Contact form */}
      <div className="lg:col-span-2">
        <div className="rounded-xl bg-white shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#000f22] mb-2">Send Us a Message</h2>
          <p className="text-sm text-[#4F5B76] mb-6">Fill out the form below and we&apos;ll get back to you as soon as possible.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-[#f7fafd]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-[#f7fafd]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  className="bg-[#f7fafd]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="bg-[#f7fafd]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggestion">Suggestions</SelectItem>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="business">Business Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                className="bg-[#f7fafd] resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#000f22] hover:bg-[#0A2540] text-white h-11 px-8"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#000f22]/5 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-[#000f22]" />
              </div>
              <div>
                <h4 className="font-medium text-[#000f22] text-sm">Email</h4>
                <a href={`mailto:${contactEmail}`} className="text-sm text-[#00D1FF] hover:underline break-all">
                  {contactEmail}
                </a>
              </div>
            </div>
            {addressLine1 && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#000f22]/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-[#000f22]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#000f22] text-sm">Address</h4>
                  <p className="text-sm text-[#4F5B76]">
                    {addressLine1}
                    {addressLine2 && <><br />{addressLine2}</>}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card bg-[#000f22] border-0">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-[#00D1FF] mx-auto mb-3" />
            <h4 className="font-semibold text-white mb-2">Response Time</h4>
            <p className="text-sm text-[#768dad]">
              We typically respond within 24 hours on business days. For urgent issues, please mention it in your subject line.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

