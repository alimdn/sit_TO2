'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, ArrowLeft, Plus, ShoppingCart, Sparkles, X, Globe, MessageSquare, ChevronDown, PenLine, LayoutDashboard, Clock } from 'lucide-react'

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

const EXTRA_FEATURES_POOL = [
  'Responsive Design', 'SEO Optimized', 'Contact Forms', 'Analytics Integration',
  'Multi-page Layout', 'Newsletter Signup', 'Image Gallery', 'Video Support',
  'Smooth Animations', 'Project Pages', 'About Section', 'Client Testimonials',
  'Product Catalog', 'Shopping Cart', 'Secure Checkout', 'Inventory Management',
  'Customer Reviews', 'Payment Integration', 'Content Management', 'Categories & Tags',
  'Social Sharing', 'Comments System', 'Search Functionality', 'RSS Feed',
  'Dashboard Layout', 'Data Visualization', 'User Management', 'API Integration',
  'Authentication', 'Billing Pages', 'Team Pages', 'Service Showcases',
  'Case Studies', 'Client Portal', 'Multi-language', 'CRM Integration',
  'Menu Display', 'Online Reservations', 'Photo Gallery', 'Location Map',
  'Opening Hours', 'Online Ordering', 'Landing Pages', 'Feature Grid',
  'Pricing Tables', 'Waitlist Signup', 'Product Demo', 'Documentation',
]

const FREE_FEATURES_LIMIT = 5

const SIMILARITY_OPTIONS = [
  { id: 'layout', label: 'Layout', labelAr: 'الشكل', icon: '🏗️' },
  { id: 'features', label: 'Features', labelAr: 'الميزة', icon: '⚙️' },
  { id: 'colors', label: 'Colors', labelAr: 'الألوان', icon: '🎨' },
  { id: 'images', label: 'Image Density', labelAr: 'كثافة الصور', icon: '🖼️' },
  { id: 'structure', label: 'Structure', labelAr: 'ترتيب الموقع', icon: '📐' },
]

export default function TemplatePreview() {
  const { previewTemplate, setPreviewTemplate, setCurrentPage, user, setCheckoutData } = useAppStore()
  const [template, setTemplate] = useState<Template | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [showFeaturePicker, setShowFeaturePicker] = useState(false)
  const [customFeatureInput, setCustomFeatureInput] = useState('')

  // New: Additional info & similar site
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [similarSiteUrl, setSimilarSiteUrl] = useState('')
  const [selectedSimilarities, setSelectedSimilarities] = useState<string[]>([])

  // Reset when template changes
  const prevTemplateRef = useState<string | null>(null)
  if (prevTemplateRef[0] !== previewTemplate) {
    prevTemplateRef[1](previewTemplate)
    if (previewTemplate) {
      setSelectedAddOns([])
      setBilling('monthly')
      setShowFeaturePicker(false)
      setAdditionalInfo('')
      setSimilarSiteUrl('')
      setSelectedSimilarities([])
    }
  }

  useEffect(() => {
    if (!previewTemplate) return
    let cancelled = false
    fetch(`/api/templates/${previewTemplate}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setTemplate(data)
          const templateFeatures: string[] = data?.features ? JSON.parse(data.features) : []
          setSelectedFeatures(templateFeatures)
        }
      })
      .catch(() => { if (!cancelled) setTemplate(null) })
    return () => { cancelled = true; setTemplate(null) }
  }, [previewTemplate])

  if (!previewTemplate) return null

  const industries: string[] = template?.industries ? JSON.parse(template.industries) : []

  const basePriceMonthly = 30
  const basePriceAnnual = 300
  const extraFeaturesCount = Math.max(0, selectedFeatures.length - FREE_FEATURES_LIMIT)
  const extraFeatureCost = extraFeaturesCount * 3
  const addOnCostMonthly = selectedAddOns.length * 3
  const addOnCostAnnual = selectedAddOns.length * 36

  const basePrice = billing === 'monthly' ? basePriceMonthly : basePriceAnnual
  const extraFeatureTotal = billing === 'monthly' ? extraFeatureCost : extraFeatureCost * 12
  const addOnTotal = billing === 'monthly' ? addOnCostMonthly : addOnCostAnnual
  const total = basePrice + extraFeatureTotal + addOnTotal
  const period = billing === 'monthly' ? 'mo' : 'yr'

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const removeFeature = (feature: string) => {
    setSelectedFeatures(prev => prev.filter(f => f !== feature))
  }

  const addFeature = (feature: string) => {
    if (!selectedFeatures.includes(feature)) {
      setSelectedFeatures(prev => [...prev, feature])
    }
    setShowFeaturePicker(false)
  }

  const addCustomFeature = () => {
    const trimmed = customFeatureInput.trim()
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures(prev => [...prev, trimmed])
    }
    setCustomFeatureInput('')
  }

  const handleCustomFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomFeature()
    }
  }

  const toggleSimilarity = (id: string) => {
    setSelectedSimilarities(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const availableFeatures = EXTRA_FEATURES_POOL.filter(f => !selectedFeatures.includes(f))

  const handleProceedToCheckout = () => {
    if (!template) return
    if (!user) {
      setCurrentPage('login')
      return
    }
    setCheckoutData({
      templateId: template.id,
      templateTitle: template.title,
      templateImage: template.image,
      templateCategory: template.category,
      templateFeatures: selectedFeatures,
      billing,
      selectedAddOns,
      additionalInfo,
      similarSiteUrl,
      similarSiteCriteria: selectedSimilarities,
    })
    setPreviewTemplate(null)
    setCurrentPage('checkout')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            {/* Left: Preview, Features, Notes, Similar Site (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview image */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#000f22] mb-4" style={{ letterSpacing: '-0.02em' }}>
                  {template.title}
                </h1>
                <p className="text-[#4F5B76] mb-6 leading-relaxed">{template.description}</p>
                <div className="rounded-2xl overflow-hidden border border-[#e6ebf1] shadow-card">
                  <img src={template.image} alt={template.title} className="w-full object-cover" />
                </div>
              </div>

              {/* Features - compact */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#000f22]">Features</h2>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f1f4f7] text-[#4F5B76]">
                    {selectedFeatures.length} selected · {FREE_FEATURES_LIMIT} free
                  </span>
                </div>
                <p className="text-xs text-[#4F5B76] mb-3">
                  First {FREE_FEATURES_LIMIT} free. Extra: <span className="font-semibold text-[#000f22]">+$3/{period}</span> each.
                </p>

                {/* Selected features - compact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {selectedFeatures.map((feature, i) => {
                    const isFree = i < FREE_FEATURES_LIMIT
                    return (
                      <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                        isFree ? 'bg-[#f7fafd] border-transparent' : 'bg-[#FFF8E1] border-[#FFE082]'
                      }`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isFree ? 'bg-[#10B981]/10' : 'bg-[#F59E0B]/10'
                        }`}>
                          <Check className={`h-2.5 w-2.5 ${isFree ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} />
                        </div>
                        <span className="text-[#43474d] flex-1 truncate">{feature}</span>
                        {!isFree && (
                          <span className="text-[9px] font-bold text-[#F59E0B]">+$3</span>
                        )}
                        <button
                          onClick={() => removeFeature(feature)}
                          className="w-4 h-4 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0"
                        >
                          <X className="h-2.5 w-2.5 text-[#ef4444]" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Add feature from pool */}
                <div className="relative mb-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFeaturePicker(!showFeaturePicker)}
                    className="w-full border-dashed border-[#c4c6ce] hover:border-[#00D1FF] hover:bg-[#00D1FF]/5 text-[#74777e] hover:text-[#00D1FF] h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {selectedFeatures.length < FREE_FEATURES_LIMIT
                      ? `Add Feature (${FREE_FEATURES_LIMIT - selectedFeatures.length} free left)`
                      : 'Add Feature (+$3 each)'
                    }
                  </Button>

                  {showFeaturePicker && (
                    <div className="absolute left-0 right-0 top-10 z-20 bg-white rounded-xl border border-[#e6ebf1] shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <div className="space-y-0.5">
                          {availableFeatures.map((feature, i) => (
                            <button
                              key={i}
                              onClick={() => addFeature(feature)}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#43474d] hover:bg-[#00D1FF]/5 hover:text-[#000f22] transition-colors flex items-center gap-2"
                            >
                              <Plus className="h-3 w-3 text-[#00D1FF]" />
                              {feature}
                            </button>
                          ))}
                        </div>
                        {availableFeatures.length === 0 && (
                          <p className="text-xs text-[#74777e] text-center py-2">All features selected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom feature input */}
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74777e]" />
                      <input
                        type="text"
                        value={customFeatureInput}
                        onChange={(e) => setCustomFeatureInput(e.target.value)}
                        onKeyDown={handleCustomFeatureKeyDown}
                        placeholder="Type your own feature..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-dashed border-[#c4c6ce] bg-[#f7fafd] text-xs text-[#000f22] placeholder:text-[#74777e] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/20 focus:border-[#00D1FF] transition-all"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={addCustomFeature}
                      disabled={!customFeatureInput.trim()}
                      className="h-8 px-3 border-[#00D1FF] text-[#00D1FF] hover:bg-[#00D1FF] hover:text-[#000f22] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#00D1FF] text-xs flex-shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                  {selectedFeatures.length >= FREE_FEATURES_LIMIT && customFeatureInput.trim() && (
                    <p className="text-[10px] text-[#F59E0B] mt-1 flex items-center gap-1">
                      <span className="font-semibold">+$3/{period}</span> — exceeds free feature limit
                    </p>
                  )}
                </div>
              </div>

              {/* Suitable Industries - compact */}
              {industries.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-[#e6ebf1] shadow-card">
                  <h2 className="text-sm font-bold text-[#000f22] mb-2">Suitable For</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {industries.map((industry, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-[#e6ebf1] text-[#4F5B76] py-1 px-2.5">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-[#00D1FF]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#000f22]">Additional Information</h2>
                    <p className="text-[11px] text-[#74777e]">Share any details or special requests for your website</p>
                  </div>
                </div>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="e.g., I want a modern look with blue accents, need Arabic language support, prefer a minimalist homepage..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e6ebf1] bg-[#f7fafd] text-sm text-[#000f22] placeholder:text-[#74777e] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF] resize-none transition-all"
                  rows={4}
                />
                {additionalInfo.length > 0 && (
                  <p className="text-[10px] text-[#74777e] mt-1.5 text-right">{additionalInfo.length} characters</p>
                )}
              </div>

              {/* Similar Website Reference */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#000f22]">Similar Website</h2>
                    <p className="text-[11px] text-[#74777e]">Optional — reference a website you like</p>
                  </div>
                </div>

                {/* URL input */}
                <div className="relative mb-4">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74777e]" />
                  <input
                    type="url"
                    value={similarSiteUrl}
                    onChange={(e) => setSimilarSiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ebf1] bg-[#f7fafd] text-sm text-[#000f22] placeholder:text-[#74777e] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all"
                  />
                  {similarSiteUrl && (
                    <button
                      onClick={() => setSimilarSiteUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center"
                    >
                      <X className="h-3 w-3 text-[#ef4444]" />
                    </button>
                  )}
                </div>

                {/* Similarity options - multi-select */}
                <div>
                  <p className="text-xs font-medium text-[#43474d] mb-2">What do you like about it? <span className="text-[#74777e] font-normal">(select all that apply)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {SIMILARITY_OPTIONS.map((option) => {
                      const isSelected = selectedSimilarities.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleSimilarity(option.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                            isSelected
                              ? 'border-[#7C3AED] bg-[#7C3AED]/5 ring-1 ring-[#7C3AED]/30 text-[#7C3AED]'
                              : 'border-[#e6ebf1] text-[#4F5B76] hover:border-[#c4c6ce] hover:bg-[#f7fafd]'
                          }`}
                        >
                          <span>{option.icon}</span>
                          <span>{option.labelAr}</span>
                          <span className="text-[#74777e]">({option.label})</span>
                          {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Preview link */}
                {similarSiteUrl && (
                  <div className="mt-3 p-2.5 rounded-lg bg-[#7C3AED]/5 border border-[#7C3AED]/10 flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-[#7C3AED] flex-shrink-0" />
                    <a
                      href={similarSiteUrl.startsWith('http') ? similarSiteUrl : `https://${similarSiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#7C3AED] hover:underline truncate"
                    >
                      {similarSiteUrl}
                    </a>
                    {selectedSimilarities.length > 0 && (
                      <span className="text-[10px] text-[#74777e] ml-auto flex-shrink-0">
                        {selectedSimilarities.length} similarity{selectedSimilarities.length > 1 ? 'ies' : 'y'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pricing & Add-ons (1 column) */}
            <div className="space-y-6">
              {/* Price summary with billing toggle */}
              <div className="bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] rounded-2xl text-white sticky top-36 overflow-hidden">
                {/* Billing toggle */}
                <div className="px-6 pt-5 pb-4 border-b border-[#768dad]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-5 w-5 text-[#00D1FF]" />
                    <span className="font-semibold">Choose your plan</span>
                  </div>
                  <div className="flex bg-white/10 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => setBilling('monthly')}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        billing === 'monthly' ? 'bg-[#00D1FF] text-[#000f22] shadow-md' : 'text-[#768dad] hover:text-white'
                      }`}
                    >
                      Monthly — $30/mo
                    </button>
                    <button
                      onClick={() => setBilling('annual')}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                        billing === 'annual' ? 'bg-[#00D1FF] text-[#000f22] shadow-md' : 'text-[#768dad] hover:text-white'
                      }`}
                    >
                      Annual — $300/yr
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        billing === 'annual' ? 'bg-[#000f22] text-[#00D1FF]' : 'bg-[#10B981]/20 text-[#10B981]'
                      }`}>
                        -17%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Order details */}
                <div className="p-6 space-y-2.5 pb-4 border-b border-[#768dad]/20">
                  <div className="flex items-center gap-3">
                    <img src={template.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.title}</p>
                      <p className="text-xs text-[#768dad]">{template.category}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-[#768dad]">Plan ({billing === 'monthly' ? 'Monthly' : 'Annual'})</span>
                    <span>${basePrice}/{period}</span>
                  </div>

                  {extraFeaturesCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#768dad]">Extra features ({extraFeaturesCount} × $3)</span>
                      <span className="text-[#F59E0B]">+${extraFeatureTotal}/{period}</span>
                    </div>
                  )}

                  {selectedAddOns.map((addOnId) => {
                    const addOn = ADD_ONS.find(a => a.id === addOnId)
                    return addOn ? (
                      <div key={addOnId} className="flex justify-between text-sm">
                        <span className="text-[#768dad] truncate mr-2">{addOn.name}</span>
                        <span className="text-[#00D1FF] flex-shrink-0">+{billing === 'monthly' ? '$3/mo' : '$36/yr'}</span>
                      </div>
                    ) : null
                  })}

                  {/* Similar site & notes indicators */}
                  {(similarSiteUrl || additionalInfo) && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {similarSiteUrl && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#c4b5fd] flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" /> Ref site added
                        </span>
                      )}
                      {additionalInfo && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00D1FF]/20 text-[#67e8f9] flex items-center gap-1">
                          <MessageSquare className="h-2.5 w-2.5" /> Notes added
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-6 pt-4 pb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[#768dad] text-sm">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold">${total}</span>
                      <span className="text-[#768dad] text-sm">/{period}</span>
                    </div>
                  </div>

                  {(extraFeaturesCount > 0 || selectedAddOns.length > 0) && (
                    <p className="text-[10px] text-[#768dad] mb-4 leading-relaxed">
                      * Extra features & add-ons fees apply for the first year only
                    </p>
                  )}

                  {/* Delivery & Dashboard alerts */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                      <LayoutDashboard className="h-4 w-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#10B981] leading-relaxed">
                        <span className="font-semibold">Website Control Panel Included</span> — You&apos;ll get a full dashboard to manage your website content, pages, and settings.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/20">
                      <Clock className="h-4 w-4 text-[#00D1FF] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#67e8f9] leading-relaxed">
                        <span className="font-semibold">Delivery: 5-7 Business Days</span> — Your website will be ready within 5 to 7 business days after order confirmation.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-11"
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {!user && (
                    <p className="text-[10px] text-[#768dad] text-center mt-2">
                      You&apos;ll need to sign in to complete your purchase
                    </p>
                  )}
                </div>
              </div>

              {/* Add-ons list — hidden from sidebar, features section under image is sufficient */}
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
