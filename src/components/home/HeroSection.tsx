'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

const DEFAULTS = {
  hero_badge: 'AI-Powered',
  hero_title: 'Build Your Perfect Website with Ease',
  hero_subtitle: 'Professional website design on subscription. Choose from stunning templates, get expert setup, and enjoy ongoing support — all for a predictable monthly price.',
}

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
      .catch(() => {})
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
              <span className="text-[#00D1FF] text-xs font-medium">{badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
              {renderTitle()}
            </h1>

            <p className="text-base text-[#768dad] leading-relaxed mb-6 max-w-lg">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setCurrentPage('templates')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-10 px-6 text-sm"
              >
                Browse Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setCurrentPage('plans')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                variant="outline"
                className="border-[#00D1FF]/50 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF] h-10 px-6 text-sm"
              >
                View Plans
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#768dad]/20">
              <div>
                <div className="text-xl font-bold text-white">500+</div>
                <div className="text-xs text-[#768dad]">Websites Built</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">98%</div>
                <div className="text-xs text-[#768dad]">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-xl font-bold text-white">24/7</div>
                <div className="text-xs text-[#768dad]">Support Available</div>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="hidden lg:block animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00D1FF]/20 to-[#10B981]/20 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-overlay border border-[#768dad]/20">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                  alt="Professional Website Design"
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000f22]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00D1FF] flex items-center justify-center">
                        <Play className="h-4 w-4 text-[#000f22] ml-0.5" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Watch Demo</div>
                        <div className="text-[#768dad] text-xs">See how it works in 2 minutes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

