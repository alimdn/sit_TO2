'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, ShoppingBag, CreditCard, MessageSquare, TrendingUp, DollarSign, Upload, RotateCcw, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface Stats {
  users: number
  orders: number
  subscriptions: number
  revenue: number
  tickets: number
  messages: number
}

// Image slots that the admin can customize on the homepage.
// Each entry maps to a key in the SiteSetting table and has a local default fallback.
const IMAGE_SLOTS = [
  {
    key: 'home_hero_image',
    label: 'Hero Image (الواجهة الرئيسية)',
    description: 'يظهر في القسم العلوي بدلاً من الفيديو. يفضل PNG بأبعاد 1920×1080.',
    fallback: '/images/home/hero-default.png',
  },
  {
    key: 'home_features_design_image',
    label: 'Design Services Image (عمود التصميم)',
    description: 'يظهر في القسم الأيمن لـ "Everything You Need". يفضل PNG بأبعاد 800×600.',
    fallback: '/images/home/features-design.png',
  },
  {
    key: 'home_features_hosting_image',
    label: 'Hosting Services Image (عمود الاستضافة)',
    description: 'يظهر في القسم الأيسر لـ "Everything You Need". يفضل PNG بأبعاد 800×600.',
    fallback: '/images/home/features-hosting.png',
  },
  {
    key: 'home_faq_image',
    label: 'FAQ Section Image (قسم الأسئلة الشائعة)',
    description: 'يظهر بجانب قائمة الأسئلة الشائعة. يفضل PNG عمودي بأبعاد 600×800.',
    fallback: '/images/home/faq-default.png',
  },
] as const

export default function AdminSettings() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch((e) => console.error('[AdminSettings] fetch error:', e))

    fetch('/api/settings')
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch((e) => console.error('[AdminSettings] fetch error:', e))
  }, [])

  const handleSaveSetting = async (key: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] || '' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to save setting')
        return
      }
      toast.success('Setting saved')
    } catch {
      toast.error('Failed to save setting')
    }
  }

  const handleImageUpload = async (key: string, file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setUploadingKey(key)
    try {
      // Step 1: convert file to base64
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Step 2: upload to Cloudinary via /api/upload-image (admin-only route)
      const upRes = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, folder: 'home-images' }),
      })
      if (!upRes.ok) {
        const err = await upRes.json().catch(() => ({}))
        toast.error(err.error || 'Upload failed')
        return
      }
      const upData = await upRes.json()
      const url: string = upData.url

      // Step 3: save the URL to settings
      const saveRes = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: url }),
      })
      if (!saveRes.ok) {
        toast.error('Image uploaded but failed to save setting')
        return
      }

      setSettings((prev) => ({ ...prev, [key]: url }))
      toast.success('Image uploaded and saved')
    } catch (e) {
      console.error('[AdminSettings] image upload error:', e)
      toast.error('Failed to upload image')
    } finally {
      setUploadingKey(null)
    }
  }

  const handleResetImage = async (key: string, fallback: string) => {
    try {
      // Save an empty value — the frontend will fall back to the local default
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: '' }),
      })
      if (!res.ok) {
        toast.error('Failed to reset image')
        return
      }
      setSettings((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      toast.success('Reset to default image')
    } catch {
      toast.error('Failed to reset image')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#29503c]">Settings & Overview</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#416853]/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#416853]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">{stats?.users || 0}</p>
              <p className="text-xs text-[#414843]">Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#29503c]/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-[#29503c]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">{stats?.orders || 0}</p>
              <p className="text-xs text-[#414843]">Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFB800]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#FFB800]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">{stats?.subscriptions || 0}</p>
              <p className="text-xs text-[#414843]">Subscriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#29503c]/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#29503c]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">${stats?.revenue || 0}</p>
              <p className="text-xs text-[#414843]">Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#717973]/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[#717973]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">{stats?.tickets || 0}</p>
              <p className="text-xs text-[#414843]">Support Tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#29503c]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#29503c]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#29503c]">{stats?.messages || 0}</p>
              <p className="text-xs text-[#414843]">Messages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homepage Images — manageable from admin */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#00D1FF]" />
            Homepage Images — صور الصفحة الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {IMAGE_SLOTS.map((slot) => {
            const current = settings[slot.key] || slot.fallback
            const isCustom = !!settings[slot.key]
            const isUploading = uploadingKey === slot.key
            return (
              <div key={slot.key} className="rounded-xl border border-[#e6ebf1] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  {/* Preview */}
                  <div className="bg-[#f7fafd] p-4 flex items-center justify-center border-b md:border-b-0 md:border-l border-[#e6ebf1]">
                    <img
                      src={current}
                      alt={slot.label}
                      className="max-h-32 w-auto rounded-md object-contain"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = slot.fallback
                      }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="md:col-span-2 p-4 space-y-3">
                    <div>
                      <Label className="text-sm font-semibold text-[#000f22]">{slot.label}</Label>
                      <p className="text-xs text-[#4F5B76] mt-1 leading-relaxed">{slot.description}</p>
                    </div>

                    {/* URL input + save */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-[#4F5B76]">Image URL</Label>
                        <Input
                          value={settings[slot.key] || ''}
                          onChange={(e) => setSettings({ ...settings, [slot.key]: e.target.value })}
                          placeholder={slot.fallback}
                          className="bg-[#f7fafd] text-xs font-mono"
                        />
                      </div>
                      <Button
                        onClick={() => handleSaveSetting(slot.key)}
                        size="sm"
                        className="bg-[#000f22] hover:bg-[#0A2540] text-white"
                      >
                        Save URL
                      </Button>
                    </div>

                    {/* Upload + Reset */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        ref={(el) => { fileInputRefs.current[slot.key] = el }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(slot.key, file)
                          e.target.value = '' // reset so the same file can be re-selected
                        }}
                      />
                      <Button
                        onClick={() => fileInputRefs.current[slot.key]?.click()}
                        size="sm"
                        disabled={isUploading}
                        className="bg-[#10B981] hover:bg-[#059669] text-white"
                      >
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        {isUploading ? 'Uploading...' : 'Upload PNG'}
                      </Button>
                      {isCustom && (
                        <Button
                          onClick={() => handleResetImage(slot.key, slot.fallback)}
                          size="sm"
                          variant="outline"
                          className="text-[#4F5B76]"
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Reset to Default
                        </Button>
                      )}
                      {isCustom && (
                        <span className="text-xs text-[#10B981] ml-auto">✓ Custom image set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="mt-4 p-3 rounded-lg bg-[#00D1FF]/5 border border-[#00D1FF]/20 text-xs text-[#4F5B76] leading-relaxed">
            <strong className="text-[#00D1FF]">How it works:</strong> Images are uploaded to Cloudinary and the URL is stored in the database.
            The homepage reads each URL on load — if no URL is set (or the URL fails to load), the local default PNG is used instead.
            Supports PNG, JPG, and WebP up to 5MB. Recommended dimensions are noted next to each slot.
          </div>
        </CardContent>
      </Card>

      {/* Site Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'site_name', label: 'Site Name' },
            { key: 'site_description', label: 'Site Description' },
            { key: 'contact_email', label: 'Contact Email' },
            { key: 'contact_address', label: 'Contact Address' },
            { key: 'hero_badge', label: 'Hero Badge Text (e.g. AI-Powered)' },
            { key: 'hero_title', label: 'Hero Title' },
            { key: 'hero_subtitle', label: 'Hero Subtitle' },
          ].map((field) => (
            <div key={field.key} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="bg-[#faf9f6]"
                />
              </div>
              <Button onClick={() => handleSaveSetting(field.key)} size="sm" className="bg-[#29503c] hover:bg-[#284e3b] text-white mb-0.5">
                Save
              </Button>
            </div>
          ))}
          <div className="mt-4 p-3 rounded-lg bg-[#416853]/5 border border-[#416853]/20 text-xs text-[#414843] leading-relaxed">
            <strong className="text-[#416853]">Note:</strong> Changes are saved to the database and reflected on the live site immediately (Header logo text, Footer contact info, Hero section, Contact page). If a field is left empty, the default hardcoded value is used.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
