'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  features: string
  popular: boolean
}

export default function PlansPage() {
  const { setCurrentPage, user } = useAppStore()
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(() => {})
  }, [])

  const handleSubscribe = (planId: string) => {
    if (!user) {
      setCurrentPage('login')
      return
    }
    // Create subscription
    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
      .then(res => res.json())
      .then(() => {
        setCurrentPage('dashboard')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => {})
  }

  return (
    <div>
      {/* Plans header */}
      <div className="text-center mb-12">
        <span className="label-style text-[#00D1FF] text-xs block mb-3">Pricing Plans</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
          Choose the plan that fits your needs. Both include professional design, hosting, and ongoing support.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {plans.map((plan) => {
          const features: string[] = plan.features ? JSON.parse(plan.features) : []
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-[#000f22] text-white shadow-overlay ring-2 ring-[#00D1FF]'
                  : 'bg-white shadow-card hover:shadow-card-hover'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#00D1FF] text-[#000f22] hover:bg-[#00b8e6] px-3 py-1">
                    <Star className="h-3 w-3 mr-1" /> Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-[#000f22]'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-[#00D1FF]' : 'text-[#000f22]'}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-[#768dad]' : 'text-[#4F5B76]'}`}>
                    /{plan.interval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {plan.interval === 'annual' && (
                  <p className={`text-xs mt-1 ${plan.popular ? 'text-[#768dad]' : 'text-[#10B981]'}`}>
                    Save 2 months with annual billing
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-[#00D1FF]' : 'text-[#10B981]'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-[#c4c6ce]' : 'text-[#43474d]'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full h-11 font-semibold ${
                  plan.popular
                    ? 'bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22]'
                    : 'bg-[#000f22] hover:bg-[#0A2540] text-white'
                }`}
              >
                Get Started
              </Button>
            </div>
          )
        })}
      </div>

      {/* Subscription Policies */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-[#000f22] text-center mb-8">Subscription Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Free Cancellation',
              description: 'Cancel your subscription at any time. No long-term contracts or hidden fees.',
              icon: '🔄',
            },
            {
              title: '30-Day Guarantee',
              description: 'Not satisfied? Get a full refund within the first 30 days, no questions asked.',
              icon: '✅',
            },
            {
              title: 'Instant Access',
              description: 'Start building your website immediately after subscribing. No waiting required.',
              icon: '⚡',
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

      {/* Feature showcase */}
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
