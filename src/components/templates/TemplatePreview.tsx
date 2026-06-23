'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, ArrowLeft, Plus, ShoppingCart, Sparkles, X, Globe, MessageSquare, PenLine, LayoutDashboard, Clock, Search, AlertTriangle, ExternalLink, RotateCw } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string
  industries: string
  featured: boolean
  previewUrl?: string
  livePreview?: string
}

// ─── Shared Add-Ons (appear in BOTH Regular and Store lists) ───
// These are general-purpose enhancements suitable for any website type.
const SHARED_ADD_ONS = [
  { id: 'seo', name: 'Advanced SEO Package', description: 'Optimized meta tags, sitemap, schema markup & weekly SEO reports' },
  { id: 'analytics', name: 'Analytics Dashboard', description: 'Real-time visitor tracking, conversion funnels & custom reports' },
  { id: 'multilang', name: 'Multi-Language Support', description: 'Translate your website into up to 5 languages with auto-detection' },
  { id: 'blog', name: 'Blog & Content Studio', description: 'Full blogging platform with categories, tags, scheduling & newsletter' },
  { id: 'social', name: 'Social Media Integration', description: 'Auto-post, social feeds, share buttons & analytics tracking' },
  { id: 'chat', name: 'Live Chat Widget', description: 'Real-time chat with visitors, automated greetings & chatbot support' },
  { id: 'security', name: 'Advanced Security Suite', description: 'DDoS protection, malware scanning, 2FA & security monitoring' },
  { id: 'backup', name: 'Automated Backups', description: 'Daily backups with one-click restore & 30-day retention' },
  { id: 'speed', name: 'Performance Booster', description: 'CDN, image optimization, lazy loading & Core Web Vitals tuning' },
  { id: 'like_button', name: 'Like / Favorite Button', description: 'Animated like button with particle effects (React component)' },
]

// ─── Regular-only Add-Ons (NOT shown for Store Package) ───
// Store Package already includes e-commerce in its base features, so this
// basic e-commerce module is only offered to Regular plan customers.
const REGULAR_ONLY_ADD_ONS = [
  { id: 'ecommerce', name: 'E-Commerce Module', description: 'Product catalog, shopping cart, payment integration & inventory (basic)' },
]

// Regular Add-Ons = shared + regular-only
const ADD_ONS = [...SHARED_ADD_ONS, ...REGULAR_ONLY_ADD_ONS]

// ─── Store-only Add-Ons (NOT shown for Regular plan) ───
// These are advanced e-commerce features that only make sense for stores.
const STORE_ONLY_ADD_ONS = [
  { id: 'store_loyalty', name: 'Loyalty & Rewards Pro', description: 'Points engine, VIP tiers, referral program & birthday rewards' },
  { id: 'store_email', name: 'Email Marketing Automation', description: 'Welcome series, abandoned cart, post-purchase & win-back flows' },
  { id: 'store_sms', name: 'SMS Marketing & Notifications', description: 'Order updates, delivery alerts, promo campaigns & 2FA SMS' },
  { id: 'store_reviews', name: 'Reviews & UGC Engine', description: 'Photo/video reviews, Q&A, automated review requests & moderation' },
  { id: 'store_abandoned', name: 'Abandoned Cart Recovery Pro', description: 'Multi-channel recovery (email + SMS + push) with AI timing' },
  { id: 'store_subscriptions', name: 'Subscription Box Module', description: 'Recurring billing, customizable boxes, skip/pause & customer portal' },
  { id: 'store_marketplace', name: 'Multi-Vendor Marketplace', description: 'Vendor onboarding, commission splits, vendor dashboards & payouts' },
  { id: 'store_b2b', name: 'B2B Wholesale Tier', description: 'Wholesale pricing, bulk order forms, quote requests & net-30 terms' },
  { id: 'store_integrations', name: 'ERP & Accounting Sync', description: 'QuickBooks, Xero, SAP, ShipStation, Mailchimp & Zapier integrations' },
  { id: 'store_ar', name: 'AR Product Try-On', description: '3D product viewer & augmented reality try-on for fashion/beauty/home' },
  { id: 'store_localization', name: 'Global Tax & Duties', description: 'Real-time tax calculation, HS codes, duty estimates & IOSS compliance' },
]

// Store Add-Ons = shared + store-only
// (shared add-ons come first, then store-specific ones)
const STORE_ADD_ONS = [...SHARED_ADD_ONS, ...STORE_ONLY_ADD_ONS]

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

// Store-specific features pool — shown when the customer selects Store Package.
// These replace the regular template features in the Features section.
// The free limit is 10 (vs 5 for regular plans).
const STORE_FEATURES_POOL = [
  'Daily Automated Backups',
  'Full E-Commerce Functionality',
  'Unlimited Products & Categories',
  'Payment Gateway Integration (Stripe / PayPal)',
  'Inventory Management Dashboard',
  'Order Tracking System',
  'Customer Accounts & Login',
  'Shopping Cart & Secure Checkout',
  '100 GB Hosting Storage',
  'Priority 24/7 Support',
  'Advanced SEO & Analytics',
  'Product Search & Filtering',
  'Discount Codes & Promotions',
  'Wishlist & Favorites',
  'Product Reviews & Ratings',
  'Email Notifications',
  'Invoice Generation',
  'Multi-Currency Support',
  'Tax Calculation',
  'Shipping Rate Management',
  'Abandoned Cart Recovery',
  'Sales Reports & Charts',
  'Mobile-Responsive Store',
  'Social Media Store Sync',
  'Loyalty Program Module',
  'Gift Card System',
  'Subscription Products',
  'Digital Product Downloads',
  'Bulk Product Import/Export',
  'Multi-Vendor Support',
]

const FREE_FEATURES_LIMIT = 5

const SIMILARITY_OPTIONS = [
  { id: 'layout', label: 'Layout', icon: '🏗️' },
  { id: 'features', label: 'Features', icon: '⚙️' },
  { id: 'colors', label: 'Colors', icon: '🎨' },
  { id: 'images', label: 'Image Density', icon: '🖼️' },
  { id: 'structure', label: 'Structure', icon: '📐' },
]

export default function TemplatePreview() {
  const { previewTemplate, setPreviewTemplate, setCurrentPage, user, setCheckoutData } = useAppStore()
  const [template, setTemplate] = useState<Template | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [billing, setBilling] = useState<'monthly' | 'semi_annual' | 'annual'>('monthly')
  // Plan type toggle: 'regular' (default) or 'store' (premium with e-commerce + daily backups)
  const [planType, setPlanType] = useState<'regular' | 'store'>('regular')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [showFeaturePicker, setShowFeaturePicker] = useState(false)
  const [customFeatureInput, setCustomFeatureInput] = useState('')

  // Plan prices loaded from /api/plans so admin changes reflect here.
  // Includes all 6 plans (3 regular + 3 store variants).
  const [planPrices, setPlanPrices] = useState<Record<string, number>>({
    monthly: 30,
    semi_annual: 160,
    annual: 300,
    store: 100,
    store_semi_annual: 550,
    store_annual: 1100,
  })

  // Additional info & similar site
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [additionalInfoSaved, setAdditionalInfoSaved] = useState(false)
  const [similarSiteUrl, setSimilarSiteUrl] = useState('')
  const [selectedSimilarities, setSelectedSimilarities] = useState<string[]>([])

  // Extra template features (beyond the free limit) — available to add as paid extras
  const [extraTemplateFeatures, setExtraTemplateFeatures] = useState<string[]>([])

  // Domain search
  const [domainQuery, setDomainQuery] = useState('')
  const [domainResults, setDomainResults] = useState<any[]>([])
  const [domainSearching, setDomainSearching] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<{ domain: string; price: number } | null>(null)

  // Full screen preview
  const [showFullPreview, setShowFullPreview] = useState(false)

  // Reset add-on state when the previewed template changes.
  // Implemented as a useEffect (not setState-during-render) to avoid
  // the React anti-pattern of calling setState in the render phase.
  const prevTemplateRef = useRef<string | null>(null)
  useEffect(() => {
    if (prevTemplateRef.current !== previewTemplate) {
      prevTemplateRef.current = previewTemplate
      if (previewTemplate) {
        setSelectedAddOns([])
        setBilling('monthly')
        setShowFeaturePicker(false)
        setAdditionalInfo('')
        setSimilarSiteUrl('')
        setSelectedSimilarities([])
        setDomainQuery('')
        setDomainResults([])
        setSelectedDomain(null)
      }
    }
  }, [previewTemplate])

  // When the user switches plan type (Regular ↔ Store), reset the selected
  // features and add-ons so the new pool's auto-selected items show up correctly.
  // We pre-select the first N features from the new pool (5 for Regular,
  // 10 for Store) so the user sees a sensible default set immediately.
  // Add-ons are reset to empty (user picks manually).
  const prevPlanTypeRef = useRef<'regular' | 'store'>('regular')
  useEffect(() => {
    if (prevPlanTypeRef.current !== planType) {
      prevPlanTypeRef.current = planType
      // Reset selected features and pre-select from the new pool
      const pool = planType === 'store' ? STORE_FEATURES_POOL : EXTRA_FEATURES_POOL
      const limit = planType === 'store' ? 10 : FREE_FEATURES_LIMIT
      setSelectedFeatures(pool.slice(0, limit))
      // Reset add-ons (different IDs for Regular vs Store)
      setSelectedAddOns([])
      setShowFeaturePicker(false)
    }
  }, [planType])

  useEffect(() => {
    if (!previewTemplate) return
    let cancelled = false
    setTemplate(null)
    setTemplateError(null)
    fetch(`/api/templates/${previewTemplate}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!cancelled && data && data.id) {
          setTemplate(data)
          const templateFeatures: string[] = data?.features ? JSON.parse(data.features) : []
          // Only auto-select the first 5 features (within the free limit).
          // Remaining template features are moved to the available pool so the
          // customer can manually add them as paid extras (+$3 each).
          setSelectedFeatures(templateFeatures.slice(0, FREE_FEATURES_LIMIT))
          setExtraTemplateFeatures(templateFeatures.slice(FREE_FEATURES_LIMIT))
        } else if (!cancelled) {
          setTemplateError('Template not found')
        }
      })
      .catch((e) => {
        console.error('[TemplatePreview] Failed to load template:', e)
        if (!cancelled) {
          setTemplate(null)
          setTemplateError('Failed to load template. Please try again.')
        }
      })
    return () => { cancelled = true; setTemplate(null); setTemplateError(null) }
  }, [previewTemplate])

  // Fetch plan prices once so admin changes propagate to this preview.
  useEffect(() => {
    let cancelled = false
    fetch('/api/plans')
      .then(r => r.json())
      .then(data => {
        if (cancelled || !Array.isArray(data)) return
        const map: Record<string, number> = {}
        data.forEach((p: { interval: string; price: number; active: boolean }) => {
          if (p.active) map[p.interval] = p.price
        })
        if (Object.keys(map).length > 0) setPlanPrices(prev => ({ ...prev, ...map }))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!previewTemplate) return null

  const basePriceMonthly = planPrices.monthly ?? 30
  const basePriceSemiAnnual = planPrices.semi_annual ?? 160
  const basePriceAnnual = planPrices.annual ?? 300
  // Store Package prices
  const storePriceMonthly = planPrices.store ?? 100
  const storePriceSemiAnnual = planPrices.store_semi_annual ?? 550
  const storePriceAnnual = planPrices.store_annual ?? 1100

  // Dynamic free-feature limit based on plan type:
  //   Regular = 5 free, Store = 10 free
  // MUST be declared before extraFeaturesCount (which uses it).
  const currentFreeLimit = planType === 'store' ? 10 : FREE_FEATURES_LIMIT

  const extraFeaturesCount = Math.max(0, selectedFeatures.length - currentFreeLimit)
  const extraFeatureCost = extraFeaturesCount * 3

  // Add-on free limit: 0 for Regular (all add-ons are paid at $3/mo each),
  // 10 for Store Package (first 10 add-ons free, extras +$3/mo each)
  const addOnFreeLimit = planType === 'store' ? 10 : 0
  const extraAddOnsCount = Math.max(0, selectedAddOns.length - addOnFreeLimit)
  const addOnCostMonthly = extraAddOnsCount * 3
  const addOnCostSemiAnnual = extraAddOnsCount * 18
  const addOnCostAnnual = extraAddOnsCount * 36

  // The current add-ons list (Regular or Store-specific)
  const currentAddOns = planType === 'store' ? STORE_ADD_ONS : ADD_ONS

  // Domain cost calculation
  const domainBaseIncluded = 50
  const domainExcess = selectedDomain ? Math.max(0, selectedDomain.price - domainBaseIncluded) : 0
  const domainMonthlyInstallment = domainExcess > 0 ? 3 : 0
  const domainInstallmentMonths = domainMonthlyInstallment > 0 ? Math.ceil(domainExcess / domainMonthlyInstallment) : 0

  // Compute base price based on plan type + billing cycle
  const basePrice = planType === 'store'
    ? (billing === 'monthly' ? storePriceMonthly : billing === 'semi_annual' ? storePriceSemiAnnual : storePriceAnnual)
    : (billing === 'monthly' ? basePriceMonthly : billing === 'semi_annual' ? basePriceSemiAnnual : basePriceAnnual)
  const billingMonths = billing === 'monthly' ? 1 : billing === 'semi_annual' ? 6 : 12
  const extraFeatureTotal = extraFeatureCost * billingMonths
  const addOnTotal = billing === 'monthly' ? addOnCostMonthly : billing === 'semi_annual' ? addOnCostSemiAnnual : addOnCostAnnual
  const domainInstallmentTotal = domainMonthlyInstallment * billingMonths
  const total = basePrice + extraFeatureTotal + addOnTotal + domainInstallmentTotal
  const period = billing === 'monthly' ? 'mo' : billing === 'semi_annual' ? '6mo' : 'yr'

  // The effective billing interval sent to the API (store_* when Store Package is selected)
  const effectiveBilling = planType === 'store'
    ? (billing === 'monthly' ? 'store' : billing === 'semi_annual' ? 'store_semi_annual' : 'store_annual')
    : billing

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

  const handleSaveAdditionalInfo = () => {
    setAdditionalInfoSaved(true)
  }

  const handleEditAdditionalInfo = () => {
    setAdditionalInfoSaved(false)
  }

  // Domain search
  const handleDomainSearch = async () => {
    if (!domainQuery.trim()) return
    setDomainSearching(true)
    setDomainResults([])
    try {
      const res = await fetch(`/api/domain-check?q=${encodeURIComponent(domainQuery.trim())}`)
      const data = await res.json()
      if (data.results) {
        setDomainResults(data.results)
      }
    } catch {
      setDomainResults([])
    }
    setDomainSearching(false)
  }

  const handleDomainKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleDomainSearch()
    }
  }

  const selectDomain = (domain: string, price: number) => {
    if (selectedDomain?.domain === domain) {
      setSelectedDomain(null)
    } else {
      setSelectedDomain({ domain, price })
    }
  }

  // Available features depend on plan type:
  // - Regular: uses EXTRA_FEATURES_POOL + template's extra features
  // - Store: uses STORE_FEATURES_POOL (e-commerce focused)
  const availableFeatures = planType === 'store'
    ? STORE_FEATURES_POOL.filter(f => !selectedFeatures.includes(f))
    : [...EXTRA_FEATURES_POOL, ...extraTemplateFeatures].filter(f => !selectedFeatures.includes(f))

  const handleProceedToCheckout = () => {
    if (!template) return
    if (!user) {
      // Save checkout data to sessionStorage so it survives the login redirect
      // Set a flag so LoginForm knows to redirect back to checkout after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingCheckout', 'true')
      }
      setCurrentPage('login')
      return
    }
    setCheckoutData({
      templateId: template.id,
      templateTitle: template.title,
      templateImage: template.image,
      templateCategory: template.category,
      templateFeatures: selectedFeatures,
      billing: effectiveBilling,
      selectedAddOns,
      additionalInfo,
      similarSiteUrl,
      similarSiteCriteria: selectedSimilarities,
      domain: selectedDomain?.domain || null,
      domainPrice: selectedDomain?.price || null,
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
                {/* Live Preview action bar */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => { setIframeLoaded(false); setShowFullPreview(true) }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#000f22] hover:bg-[#0A2540] text-white text-xs font-medium transition-colors relative overflow-hidden group/lp"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/0 via-[#00D1FF]/10 to-[#00D1FF]/0 translate-x-[-100%] group-hover/lp:translate-x-[100%] transition-transform duration-700" />
                    <ExternalLink className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">Open Full Preview</span>
                  </button>
                  <span className="text-[10px] text-[#74777e]">View template in full screen</span>
                </div>
              </div>

              {/* Plan Type Toggle — Regular vs Store Package
                  This replaces the old green "Get This Template $30" button.
                  Customer explicitly chooses plan type here. The rest of the
                  page (features, add-ons, billing cycle) stays the same —
                  only the pricing and Store-specific features change. */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <h2 className="text-base font-bold text-[#000f22] mb-3">Choose Your Plan Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Regular Plan Option */}
                  <button
                    onClick={() => setPlanType('regular')}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      planType === 'regular'
                        ? 'border-[#00D1FF] bg-[#00D1FF]/5 ring-1 ring-[#00D1FF]/30'
                        : 'border-[#e6ebf1] hover:border-[#c4c6ce] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          planType === 'regular' ? 'border-[#00D1FF] bg-[#00D1FF]' : 'border-[#c4c6ce]'
                        }`}>
                          {planType === 'regular' && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="font-bold text-sm text-[#000f22]">Regular Website</span>
                      </div>
                      <span className="text-sm font-bold text-[#000f22]">
                        ${billing === 'monthly' ? basePriceMonthly : billing === 'semi_annual' ? basePriceSemiAnnual : basePriceAnnual}/{period}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4F5B76] leading-relaxed">
                      Professional website design + hosting + maintenance.
                    </p>
                  </button>

                  {/* Store Package Option */}
                  <button
                    onClick={() => setPlanType('store')}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${
                      planType === 'store'
                        ? 'border-[#F59E0B] bg-gradient-to-br from-[#FFF8E1] to-[#FFFBF0] ring-1 ring-[#F59E0B]/30'
                        : 'border-[#e6ebf1] hover:border-[#F59E0B]/50 bg-white'
                    }`}
                  >
                    {planType === 'store' && (
                      <div className="absolute top-0 right-0 bg-[#F59E0B] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                        Selected
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          planType === 'store' ? 'border-[#F59E0B] bg-[#F59E0B]' : 'border-[#c4c6ce]'
                        }`}>
                          {planType === 'store' && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="font-bold text-sm text-[#000f22] flex items-center gap-1">
                          <ShoppingCart className="h-3.5 w-3.5 text-[#F59E0B]" />
                          Store Package
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#F59E0B]">
                        ${billing === 'monthly' ? storePriceMonthly : billing === 'semi_annual' ? storePriceSemiAnnual : storePriceAnnual}/{period}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4F5B76] leading-relaxed">
                      Everything in Regular + e-commerce + daily backups + priority support.
                    </p>
                  </button>
                </div>
              </div>

              {/* Features - compact */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-[#000f22] flex items-center gap-2">
                    {planType === 'store' && <ShoppingCart className="h-4 w-4 text-[#F59E0B]" />}
                    {planType === 'store' ? 'Store Features' : 'Features'}
                  </h2>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${planType === 'store' ? 'bg-[#F59E0B]/15 text-[#92400E]' : 'bg-[#f1f4f7] text-[#4F5B76]'}`} translate="no" lang="en">
                    {selectedFeatures.length} selected · {currentFreeLimit} free
                  </span>
                </div>
                <p className="text-xs text-[#4F5B76] mb-3">
                  First {currentFreeLimit} free. Extra: <span className="font-semibold text-[#000f22]" translate="no" lang="en">+$3/{period}</span> each.
                </p>

                {/* Selected features - compact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {selectedFeatures.map((feature, i) => {
                    const isFree = i < currentFreeLimit
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
                          <span className="text-[9px] font-bold text-[#F59E0B]" translate="no" lang="en">+$3</span>
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
                    className={`w-full border-dashed h-8 text-xs ${
                      planType === 'store'
                        ? 'border-[#F59E0B]/50 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 text-[#92400E] hover:text-[#F59E0B]'
                        : 'border-[#c4c6ce] hover:border-[#00D1FF] hover:bg-[#00D1FF]/5 text-[#74777e] hover:text-[#00D1FF]'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {selectedFeatures.length < currentFreeLimit
                      ? `Add ${planType === 'store' ? 'Store ' : ''}Feature (${currentFreeLimit - selectedFeatures.length} free left)`
                      : `Add ${planType === 'store' ? 'Store ' : ''}Feature (+$3 each)`
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
                    <p className="text-[10px] text-[#F59E0B] mt-1 flex items-center gap-1" translate="no" lang="en">
                      <span className="font-semibold">+$3/{period}</span> — exceeds free feature limit
                    </p>
                  )}
                </div>
              </div>

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
                  onChange={(e) => {
                    setAdditionalInfo(e.target.value)
                    if (additionalInfoSaved) setAdditionalInfoSaved(false)
                  }}
                  placeholder="e.g., I want a modern look with blue accents, need Arabic language support, prefer a minimalist homepage..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e6ebf1] bg-[#f7fafd] text-sm text-[#000f22] placeholder:text-[#74777e] focus:outline-none focus:ring-2 focus:ring-[#00D1FF]/30 focus:border-[#00D1FF] resize-none transition-all"
                  rows={4}
                  disabled={additionalInfoSaved}
                />
                <div className="flex items-center justify-between mt-3">
                  {additionalInfo.length > 0 && (
                    <p className="text-[10px] text-[#74777e]">{additionalInfo.length} characters</p>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    {additionalInfoSaved && (
                      <span className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    )}
                    {additionalInfoSaved ? (
                      <Button
                        onClick={handleEditAdditionalInfo}
                        variant="outline"
                        className="h-8 px-4 border-[#e6ebf1] text-[#43474d] hover:bg-[#f7fafd] text-xs"
                      >
                        <PenLine className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSaveAdditionalInfo}
                        disabled={!additionalInfo.trim()}
                        className="h-8 px-4 bg-[#000f22] hover:bg-[#0A2540] text-white text-xs disabled:opacity-40"
                      >
                        Save Information
                      </Button>
                    )}
                  </div>
                </div>
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
                          <span>{option.label}</span>
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

              {/* Domain Search */}
              <div className="bg-white rounded-2xl p-5 border border-[#e6ebf1] shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#000f22]">Search Domain</h2>
                    <p className="text-[11px] text-[#74777e]">Find & add a domain to your order</p>
                  </div>
                </div>

                {/* Search input */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#74777e]" />
                    <input
                      type="text"
                      value={domainQuery}
                      onChange={(e) => setDomainQuery(e.target.value)}
                      onKeyDown={handleDomainKeyDown}
                      placeholder="e.g. mybusiness.com or mybrand"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#e6ebf1] bg-[#f7fafd] text-sm text-[#000f22] placeholder:text-[#74777e] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleDomainSearch}
                    disabled={domainSearching || !domainQuery.trim()}
                    className="h-auto px-4 bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-semibold text-xs disabled:opacity-50"
                  >
                    {domainSearching ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Pricing notice */}
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FFF8E1] border border-[#FFE082] mb-3">
                  <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#92400E] leading-relaxed">
                    <span className="font-semibold">Domain pricing:</span> Up to $50 is included free. Any amount exceeding $50 is split into <span className="font-semibold">$3/month</span> installments added to your billing.
                  </p>
                </div>

                {/* Search results */}
                {domainResults.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[10px] font-semibold text-[#43474d] uppercase tracking-wide">Search Results</p>
                    {domainResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => result.available && selectDomain(result.domain, result.price)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          !result.available
                            ? 'border-[#fecaca] bg-[#fef2f2] opacity-60 cursor-not-allowed'
                            : selectedDomain?.domain === result.domain
                              ? 'border-[#FF6B35] bg-[#FF6B35]/5 ring-1 ring-[#FF6B35]/30'
                              : 'border-[#e6ebf1] hover:border-[#FF6B35]/40 hover:bg-[#f7fafd] cursor-pointer'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          !result.available
                            ? 'bg-[#ef4444]/10'
                            : selectedDomain?.domain === result.domain
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-[#10B981]/10'
                        }`}>
                          {!result.available ? (
                            <X className="h-3.5 w-3.5 text-[#ef4444]" />
                          ) : selectedDomain?.domain === result.domain ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-[#10B981]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium truncate ${
                              !result.available ? 'text-[#74777e] line-through' : 'text-[#000f22]'
                            }`}>
                              {result.domain}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f1f4f7] text-[#74777e] uppercase font-medium">
                              {result.tld}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#74777e]">
                            {result.available ? 'Available — click to select' : 'Taken'}
                          </p>
                        </div>
                        {/* Price is hidden in search results; it is only revealed after
                            the user selects a domain (see "Selected Domain" summary below). */}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected domain summary — only visible after the user selects a domain.
                    The price is intentionally hidden in the search results above and is
                    only revealed here once a domain has been chosen. */}
                {selectedDomain && (
                  <div className="p-3 rounded-xl bg-[#FF6B35]/5 border border-[#FF6B35]/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#000f22]">Selected Domain</span>
                      <button
                        onClick={() => setSelectedDomain(null)}
                        className="w-4 h-4 rounded-full bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center"
                      >
                        <X className="h-2.5 w-2.5 text-[#ef4444]" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#FF6B35]">{selectedDomain.domain}</p>
                    <div className="mt-1.5 text-[10px] text-[#43474d] space-y-0.5" translate="no" lang="en">
                      <p>Domain cost: <span className="font-semibold">${selectedDomain.price.toFixed(2)}/yr</span></p>
                      {selectedDomain.price <= domainBaseIncluded ? (
                        <p className="text-[#10B981] font-medium">Included free (under ${domainBaseIncluded})</p>
                      ) : (
                        <p className="text-[#F59E0B] font-medium">
                          ${domainBaseIncluded} included + ${domainExcess.toFixed(2)} split into $3/{period} for {domainInstallmentMonths} months
                        </p>
                      )}
                    </div>
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
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        billing === 'monthly' ? 'bg-[#00D1FF] text-[#000f22] shadow-md' : 'text-[#768dad] hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBilling('semi_annual')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                        billing === 'semi_annual' ? 'bg-[#00D1FF] text-[#000f22] shadow-md' : 'text-[#768dad] hover:text-white'
                      }`}
                    >
                      6-Mo
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full ${
                        billing === 'semi_annual' ? 'bg-[#000f22] text-[#00D1FF]' : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`} translate="no" lang="en">
                        -11%
                      </span>
                    </button>
                    <button
                      onClick={() => setBilling('annual')}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                        billing === 'annual' ? 'bg-[#00D1FF] text-[#000f22] shadow-md' : 'text-[#768dad] hover:text-white'
                      }`}
                    >
                      Annual
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full ${
                        billing === 'annual' ? 'bg-[#000f22] text-[#00D1FF]' : 'bg-[#10B981]/20 text-[#10B981]'
                      }`} translate="no" lang="en">
                        -17%
                      </span>
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <span className={`text-[11px] ${planType === 'store' ? 'text-[#F59E0B] font-semibold' : 'text-[#768dad]'}`} translate="no" lang="en">
                      {billing === 'monthly'
                        ? `$${planType === 'store' ? storePriceMonthly : basePriceMonthly}/month`
                        : billing === 'semi_annual'
                          ? `$${planType === 'store' ? storePriceSemiAnnual : basePriceSemiAnnual}/6 months`
                          : `$${planType === 'store' ? storePriceAnnual : basePriceAnnual}/year`
                      }
                      {planType === 'store' && <span className="ml-1">🛍️</span>}
                    </span>
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

                  <div className="flex justify-between text-sm pt-2" translate="no" lang="en">
                    <span className="text-[#768dad] flex items-center gap-1">
                      {planType === 'store' && <ShoppingCart className="h-3 w-3 text-[#F59E0B]" />}
                      {planType === 'store' ? 'Store Package' : 'Plan'} ({billing === 'monthly' ? 'Monthly' : billing === 'semi_annual' ? 'Semi-Annual' : 'Annual'})
                    </span>
                    <span className={planType === 'store' ? 'text-[#F59E0B] font-medium' : ''}>${basePrice}/{period}</span>
                  </div>

                  {extraFeaturesCount > 0 && (
                    <div className="flex justify-between text-sm" translate="no" lang="en">
                      <span className="text-[#768dad]">Extra features ({extraFeaturesCount} × $3)</span>
                      <span className="text-[#F59E0B]">+${extraFeatureTotal}/{period}</span>
                    </div>
                  )}

                  {selectedDomain && domainMonthlyInstallment > 0 && (
                    <div className="flex justify-between text-sm" translate="no" lang="en">
                      <span className="text-[#768dad]">Domain installment ({domainInstallmentMonths} × $3)</span>
                      <span className="text-[#FF6B35]">+${domainInstallmentTotal}/{period}</span>
                    </div>
                  )}

                  {/* Similar site & notes indicators */}
                  {(similarSiteUrl || additionalInfo || selectedDomain) && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {selectedDomain && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#ffb899] flex items-center gap-1">
                          <Globe className="h-2.5 w-2.5" /> {selectedDomain.domain}
                        </span>
                      )}
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
                  <div className="flex justify-between items-baseline mb-2" translate="no" lang="en">
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
                    className={`w-full font-semibold h-12 text-base shadow-md transition-colors ${
                      planType === 'store'
                        ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-[#F59E0B]/30'
                        : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[#10B981]/20'
                    }`}
                  >
                    {planType === 'store' ? '🛍️ Get Store Package' : 'Get This Template'} — ${basePrice}/{period}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {!user && (
                    <p className="text-[10px] text-[#768dad] text-center mt-2">
                      You&apos;ll need to sign in to complete your purchase
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : templateError ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-[#dc2626] text-sm font-medium">{templateError}</p>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="text-sm text-[#4F5B76] hover:text-[#000f22] underline"
            >
              Close and try again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-[3px] border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#4F5B76]">Loading template...</p>
          </div>
        )}
      </div>

      {/* Full Screen Live Preview Overlay */}
      {showFullPreview && template && (
        <div className="fixed inset-0 z-[60] bg-[#1a1a2e] flex flex-col">
          {/* Top navigation bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 h-14 bg-[#0A2540] border-b border-[#768dad]/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFullPreview(false)}
                className="flex items-center gap-2 text-sm font-medium text-[#768dad] hover:text-white transition-colors bg-[#768dad]/10 hover:bg-[#768dad]/20 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Template
              </button>
            </div>
            <span className="text-sm font-semibold text-white truncate hidden sm:block">{template.title} — Live Preview</span>
            <button
              onClick={() => setShowFullPreview(false)}
              className="w-8 h-8 rounded-lg bg-[#768dad]/10 hover:bg-[#768dad]/20 flex items-center justify-center text-[#768dad] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Browser frame */}
          <div className="flex-1 overflow-hidden flex flex-col bg-[#2a2a3e] m-3 sm:m-5 rounded-xl border border-[#768dad]/20 shadow-2xl">
            {/* Browser address bar */}
            <div className="flex items-center gap-3 px-4 h-10 bg-[#1e1e32] border-b border-[#768dad]/15 flex-shrink-0 rounded-t-xl">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              {/* Navigation buttons */}
              <div className="flex items-center gap-1 ml-2">
                <div className="w-6 h-6 rounded flex items-center justify-center text-[#768dad]">
                  <ArrowLeft className="h-3 w-3" />
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center text-[#768dad]">
                  <ArrowRight className="h-3 w-3" />
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center text-[#768dad]">
                  <RotateCw className="h-3 w-3" />
                </div>
              </div>
              {/* URL bar */}
              <div className="flex-1 flex items-center gap-2 bg-[#0A2540] rounded-lg px-3 py-1.5 max-w-lg mx-auto">
                <div className="w-3 h-3 rounded-full border border-[#10B981] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-xs text-[#768dad] truncate">
                  https://{selectedDomain?.domain || template.title.toLowerCase().replace(/\s+/g, '') + '.com'}
                </span>
              </div>
            </div>
            {/* Browser content area */}
            <div className="flex-1 overflow-hidden bg-white relative">
              {(template.livePreview || template.previewUrl) ? (
                <>
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3">
                      <div className="w-10 h-10 border-[3px] border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#4F5B76]">Loading live preview...</p>
                    </div>
                  )}
                  <iframe
                    src={template.livePreview || template.previewUrl}
                    title={`${template.title} — Live Preview`}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => setIframeLoaded(true)}
                  />
                </>
              ) : (
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
