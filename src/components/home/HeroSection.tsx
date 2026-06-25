'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Check, ShieldCheck, RefreshCw, Server } from 'lucide-react'
import { useEffect, useState } from 'react'

const DEFAULTS = {
  hero_badge: 'AI-Powered',
  hero_title: 'We Design & Host Your Website',
  hero_subtitle: 'Professional design + hosting + maintenance. No upfront cost. Cancel anytime.',
}

// Real, verifiable stats (not fake)
const REAL_STATS = [
  { value: '43', label: 'Professional Templates' },
  { value: '3', label: 'Flexible Plans (from $30/mo)' },
  { value: '$0', label: 'Upfront Cost' },
]

// Trust bar items
const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Money-Back Guarantee' },
  { icon: RefreshCw, label: 'No Long-Term Contracts' },
  { icon: Check, label: 'Cancel Anytime' },
  { icon: Server, label: 'Hosting Included' },
]

export default function HeroSection() {
  const { setCurrentPage } = useAppStore()
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch((e) => console.error('[HeroSection] fetch error:', e))
  }, [])

  const badge = settings.hero_badge || DEFAULTS.hero_badge
  const rawTitle = settings.hero_title || DEFAULTS.hero_title
  const subtitle = settings.hero_subtitle || DEFAULTS.hero_subtitle

  // Split title so the word "Website" is highlighted with the gradient.
  // If "Website" is present, wrap it. Otherwise, wrap the last word.
  const renderTitle = () => {
    if (rawTitle.includes('Website')) {
      const parts = rawTitle.split(/(Website)/)
      return parts.map((part, i) =>
        part === 'Website'
          ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#10B981]">Website</span>
          : <span key={i}>{part}</span>
      )
    }
    // Fallback: highlight last word
    const words = rawTitle.split(' ')
    if (words.length <= 1) return rawTitle
    const last = words.pop()
    return <>{words.join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#10B981]">{last}</span></>
  }

  // Navigate + scroll to top helper
  const navigateTo = (page: 'templates' | 'plans' | 'contact') => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#000f22] min-h-[450px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 209, 255, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(0, 209, 255, 0.1) 0%, transparent 50%)`,
        }} />
      </div>

      {/* Grid dots */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            {/* Premium Store Package announcement — replaces old AI-Powered badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F59E0B]/15 to-[#10B981]/15 border border-[#F59E0B]/30 mb-6">
              <span className="text-base">🛍️</span>
              <span className="text-[#F59E0B] text-sm font-bold">New: Store Package</span>
              <span className="text-[#768dad] text-xs">·</span>
              <span className="text-white text-xs">$100/month · Daily Backups Included</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              {renderTitle()}
            </h1>

            <p className="text-base text-[#768dad] leading-relaxed mb-6 max-w-lg">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Primary CTA - green/large */}
              <Button
                onClick={() => navigateTo('plans')}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold h-12 px-8 text-base shadow-lg shadow-[#10B981]/20"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {/* Secondary CTA */}
              <Button
                onClick={() => navigateTo('templates')}
                variant="outline"
                className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF] h-12 px-8 text-base"
              >
                Browse Templates
              </Button>
            </div>

            {/* Real stats — no fake numbers */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#768dad]/20">
              {REAL_STATS.map((stat, i) => (
                <div key={i}>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-[#768dad]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image — URL configurable from admin Settings (key: home_hero_image) */}
          <div className="hidden lg:block animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00D1FF]/20 to-[#10B981]/20 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-overlay border border-[#768dad]/20">
                <img
                  src={settings.home_hero_image || '/images/home/hero-default.png'}
                  alt="Professional Website Design"
                  className="w-full h-[300px] object-cover"
                  onError={(e) => {
                    // If the configured URL fails to load, fall back to the local default.
                    ;(e.currentTarget as HTMLImageElement).src = '/images/home/hero-default.png'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000f22]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <button
                    onClick={() => navigateTo('contact')}
                    className="w-full text-left bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00D1FF] flex items-center justify-center">
                        <Play className="h-4 w-4 text-[#000f22] ml-0.5" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Schedule a Demo</div>
                        <div className="text-[#768dad] text-xs">Book a 15-minute walkthrough</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar — horizontal bar below hero content */}
        <div className="mt-10 pt-8 border-t border-[#768dad]/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3 text-[#768dad]">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
