'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function PlansPage() {
  const { setCurrentPage, user } = useAppStore()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const planFeatures = [
    'Website design based on selected template',
    'Hosting service included',
    'Database setup and configuration',
    'Technical support',
    'Domain and hosting management',
    'Easy subscription management',
    'Responsive mobile-friendly design',
    'SSL certificate included',
  ]

  const price = billing === 'monthly' ? 30 : 300
  const period = billing === 'monthly' ? 'month' : 'year'
  const savings = billing === 'annual' ? 'Save $60/year (2 months free)' : null

  const handleSubscribe = () => {
    if (!user) {
      setCurrentPage('login')
      return
    }
    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: billing }),
    })
      .then(() => {
        setCurrentPage('dashboard')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => {})
  }

  return (
    <div>
      {/* Plans header */}
      <div className="text-center mb-10">
        <span className="text-[#00D1FF] text-xs font-semibold uppercase tracking-widest block mb-3">Pricing Plans</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
          One plan with everything you need. Choose your billing cycle and get started today.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center bg-[#f1f4f7] rounded-xl p-1.5 gap-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              billing === 'monthly'
                ? 'bg-[#000f22] text-white shadow-md'
                : 'text-[#43474d] hover:text-[#000f22]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-[#000f22] text-white shadow-md'
                : 'text-[#43474d] hover:text-[#000f22]'
            }`}
          >
            Annual
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              billing === 'annual'
                ? 'bg-[#00D1FF] text-[#000f22]'
                : 'bg-[#10B981]/10 text-[#10B981]'
            }`}>
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Single Pricing Card */}
      <div className="max-w-lg mx-auto mb-16">
        <div className="relative rounded-2xl bg-gradient-to-br from-[#000f22] via-[#0A2540] to-[#0A2540] p-8 text-white shadow-2xl ring-1 ring-[#00D1FF]/30 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00D1FF]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-3xl" />

          <div className="relative">
            {/* Plan name */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-[#00D1FF]" />
              <h3 className="text-lg font-semibold text-white">
                {billing === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
              </h3>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-bold text-white">${price}</span>
              <span className="text-[#768dad] text-lg">/{period}</span>
            </div>

            {/* Savings badge */}
            {savings && (
              <div className="inline-flex items-center gap-1.5 bg-[#10B981]/15 border border-[#10B981]/30 rounded-full px-3 py-1 mb-6">
                <Check className="h-3.5 w-3.5 text-[#10B981]" />
                <span className="text-[#10B981] text-xs font-semibold">{savings}</span>
              </div>
            )}

            {!savings && <div className="mb-6" />}

            {/* Divider */}
            <div className="border-t border-[#768dad]/20 mb-6" />

            {/* Features */}
            <div className="space-y-3 mb-8">
              {planFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00D1FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-[#00D1FF]" />
                  </div>
                  <span className="text-sm text-[#c4c6ce] leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleSubscribe}
              className="w-full h-12 bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold text-base"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-[#768dad] mt-3">
              No hidden fees. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Policies */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-[#000f22] text-center mb-8">Subscription Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Grace Period',
              description: 'Websites enter a 1-month grace period after payment failure. You can reactivate anytime during this period.',
              icon: '🔄',
            },
            {
              title: 'Termination Policy',
              description: 'Service is permanently terminated 6 months after the last successful payment or upon domain renewal cycle expiration.',
              icon: '⚠️',
            },
            {
              title: 'Reactivation',
              description: 'To reactivate a terminated website, it must be treated as a new project requiring new registration and setup.',
              icon: '🔧',
            },
          ].map((policy, i) => (
            <div key={i} className="p-6 rounded-xl bg-white shadow-card text-center">
              <div className="text-3xl mb-4">{policy.icon}</div>
              <h4 className="font-semibold text-[#000f22] mb-2">{policy.title}</h4>
              <p className="text-sm text-[#4F5B76] leading-relaxed">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-[#000f22] to-[#0A2540] p-8 sm:p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h3>
        <p className="text-[#768dad] max-w-lg mx-auto mb-6">
          Join hundreds of businesses that trust WebFlowSub for their online presence.
        </p>
        <Button
          onClick={() => {
            setCurrentPage('templates')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-11 px-8"
        >
          Browse Templates
        </Button>
      </div>
    </div>
  )
}
