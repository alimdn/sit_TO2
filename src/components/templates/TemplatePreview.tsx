'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, ArrowLeft, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string
  industries: string
  featured: boolean
}

const ADD_ONS = [
  { id: 'seo', name: 'Advanced SEO Package', description: 'Optimized meta tags, sitemap, schema markup & weekly SEO reports' },
  { id: 'analytics', name: 'Analytics Dashboard', description: 'Real-time visitor tracking, conversion funnels & custom reports' },
  { id: 'multilang', name: 'Multi-Language Support', description: 'Translate your website into up to 5 languages with auto-detection' },
  { id: 'ecommerce', name: 'E-Commerce Module', description: 'Product catalog, shopping cart, payment integration & inventory' },
  { id: 'blog', name: 'Blog & Content Studio', description: 'Full blogging platform with categories, tags, scheduling & newsletter' },
  { id: 'social', name: 'Social Media Integration', description: 'Auto-post, social feeds, share buttons & analytics tracking' },
  { id: 'chat', name: 'Live Chat Widget', description: 'Real-time chat with visitors, automated greetings & chatbot support' },
  { id: 'security', name: 'Advanced Security Suite', description: 'DDoS protection, malware scanning, 2FA & security monitoring' },
  { id: 'backup', name: 'Automated Backups', description: 'Daily backups with one-click restore & 30-day retention' },
  { id: 'speed', name: 'Performance Booster', description: 'CDN, image optimization, lazy loading & Core Web Vitals tuning' },
]

export default function TemplatePreview() {
  const { previewTemplate, setPreviewTemplate, setCurrentPage } = useAppStore()
  const [template, setTemplate] = useState<Template | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  // Reset add-ons when template changes
  const prevTemplateRef = useState<string | null>(null)
  if (prevTemplateRef[0] !== previewTemplate) {
    prevTemplateRef[1](previewTemplate)
    if (previewTemplate) setSelectedAddOns([])
  }

  useEffect(() => {
    if (!previewTemplate) return
    let cancelled = false
    fetch(`/api/templates/${previewTemplate}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setTemplate(data) })
      .catch(() => { if (!cancelled) setTemplate(null) })
    return () => { cancelled = true; setTemplate(null) }
  }, [previewTemplate])

  if (!previewTemplate) return null

  const features: string[] = template?.features ? JSON.parse(template.features) : []
  const industries: string[] = template?.industries ? JSON.parse(template.industries) : []

  const basePrice = 30
  const addOnCost = selectedAddOns.length * 3
  const totalMonthly = basePrice + addOnCost

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f7fafd] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e6ebf1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setPreviewTemplate(null)}
            className="flex items-center gap-2 text-sm font-medium text-[#43474d] hover:text-[#000f22] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </button>
          {template && (
            <div className="flex items-center gap-3">
              <Badge className="bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] text-xs">
                {template.category}
              </Badge>
              {template.featured && (
                <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] text-xs">
                  <Sparkles className="h-3 w-3 mr-1" /> Featured
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {template ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Preview & Features (2 columns) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Full preview image */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#000f22] mb-4" style={{ letterSpacing: '-0.02em' }}>
                  {template.title}
                </h1>
                <p className="text-[#4F5B76] mb-6 leading-relaxed">{template.description}</p>
                <div className="rounded-2xl overflow-hidden border border-[#e6ebf1] shadow-card">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full object-cover"
                  />
                </div>
              </div>

              {/* Included Features */}
              <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
                <h2 className="text-lg font-bold text-[#000f22] mb-1">Features Included</h2>
                <p className="text-sm text-[#4F5B76] mb-5">Everything that comes with your template by default</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f7fafd]">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-[#10B981]" />
                      </div>
                      <span className="text-sm text-[#43474d]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suitable Industries */}
              {industries.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
                  <h2 className="text-lg font-bold text-[#000f22] mb-4">Suitable For</h2>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((industry, i) => (
                      <Badge key={i} variant="outline" className="text-sm border-[#e6ebf1] text-[#4F5B76] py-1.5 px-3">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Add-ons & Pricing (1 column) */}
            <div className="space-y-6">
              {/* Price summary */}
              <div className="bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] rounded-2xl p-6 text-white sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-[#00D1FF]" />
                  <h3 className="font-semibold">Your Plan</h3>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-[#768dad]/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#768dad]">Base Plan</span>
                    <span>${basePrice}/mo</span>
                  </div>
                  {selectedAddOns.map((addOnId) => {
                    const addOn = ADD_ONS.find(a => a.id === addOnId)
                    return addOn ? (
                      <div key={addOnId} className="flex justify-between text-sm">
                        <span className="text-[#768dad] truncate mr-2">{addOn.name}</span>
                        <span className="text-[#00D1FF] flex-shrink-0">+$3/mo</span>
                      </div>
                    ) : null
                  })}
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-[#768dad] text-sm">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold">${totalMonthly}</span>
                    <span className="text-[#768dad] text-sm">/mo</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setPreviewTemplate(null)
                    setCurrentPage('plans')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-11"
                >
                  Subscribe Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Add-ons list */}
              <div className="bg-white rounded-2xl p-6 border border-[#e6ebf1] shadow-card">
                <div className="mb-5">
                  <h3 className="font-bold text-[#000f22] mb-1">Add-Ons</h3>
                  <p className="text-xs text-[#4F5B76]">Enhance your website with extra features — <span className="font-semibold text-[#000f22]">+$3/month</span> each</p>
                </div>
                <div className="space-y-2">
                  {ADD_ONS.map((addOn) => {
                    const isSelected = selectedAddOns.includes(addOn.id)
                    return (
                      <button
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? 'border-[#00D1FF] bg-[#00D1FF]/5 ring-1 ring-[#00D1FF]/30'
                            : 'border-[#e6ebf1] hover:border-[#c4c6ce] hover:bg-[#f7fafd]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            isSelected ? 'bg-[#00D1FF] text-[#000f22]' : 'bg-[#f1f4f7] text-[#74777e]'
                          }`}>
                            {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-medium ${isSelected ? 'text-[#000f22]' : 'text-[#43474d]'}`}>
                                {addOn.name}
                              </span>
                              <span className={`text-xs font-semibold flex-shrink-0 ${isSelected ? 'text-[#00D1FF]' : 'text-[#74777e]'}`}>
                                +$3/mo
                              </span>
                            </div>
                            <p className="text-xs text-[#74777e] mt-0.5 leading-relaxed">{addOn.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-3 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
