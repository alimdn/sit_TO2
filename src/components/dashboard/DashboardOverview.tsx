'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ExternalLink, Plus, Eye } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string | null
  plan: { name: string; price: number; interval: string }
}

interface Order {
  id: string
  status: string
  progress: number
  milestones: string
  createdAt: string
}

export default function DashboardOverview() {
  const { user, setCurrentPage, setDashboardTab } = useAppStore()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/subscriptions?userId=' + user.id).then(r => r.json()),
      fetch('/api/orders?userId=' + user.id).then(r => r.json()),
    ]).then(([subs, ords]) => {
      setSubscription(subs[0] || null)
      setOrders(ords)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-xl bg-[#eeeeea] animate-pulse" />
        ))}
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    active: 'bg-[#29503c]/10 text-[#29503c]',
    pending: 'bg-[#FFB800]/10 text-[#FFB800]',
    in_progress: 'bg-[#416853]/10 text-[#416853]',
    completed: 'bg-[#29503c]/10 text-[#29503c]',
    review: 'bg-[#717973]/10 text-[#717973]',
  }

  const stages = ['Briefing', 'Design', 'Development', 'Launch']
  const currentOrder = orders[0]
  const milestones = currentOrder ? JSON.parse(currentOrder.milestones || '[]') : []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#29503c]">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-sm text-[#414843] mt-1">Here&apos;s what&apos;s happening with your account.</p>
        </div>
      </div>

      {/* Subscription card */}
      {subscription ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Subscription</CardTitle>
              <Badge className={statusColors[subscription.status] || 'bg-gray-100 text-gray-600'}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#29503c]">{subscription.plan.name} Plan</p>
                <p className="text-sm text-[#414843] mt-1">
                  ${subscription.plan.price}/{subscription.plan.interval === 'monthly' ? 'mo' : 'yr'}
                  {subscription.endDate && ` • Renews ${new Date(subscription.endDate).toLocaleDateString()}`}
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-[#c1c8c1]">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card border-[#416853]/20 bg-[#416853]/5">
          <CardContent className="p-6 text-center">
            <p className="text-[#29503c] font-medium mb-2">No active subscription</p>
            <p className="text-sm text-[#414843] mb-4">Choose a plan to get started with your website.</p>
            <Button
              onClick={() => {
                setCurrentPage('plans')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-[#29503c] hover:bg-[#284e3b] text-white"
            >
              View Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Website progress */}
      {currentOrder && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Website Progress</CardTitle>
              <Badge className={statusColors[currentOrder.status] || 'bg-gray-100 text-gray-600'}>
                {currentOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#414843]">Overall Progress</span>
                <span className="text-sm font-semibold text-[#29503c]">{currentOrder.progress}%</span>
              </div>
              <Progress value={currentOrder.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              {stages.map((stage, i) => {
                const milestone = milestones[i]
                const isCompleted = milestone?.status === 'completed'
                const isCurrent = milestone?.status === 'in_progress'
                return (
                  <div key={stage} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-[#29503c] text-white' :
                      isCurrent ? 'bg-[#416853] text-[#29503c]' :
                      'bg-[#e5e8eb] text-[#717973]'
                    }`}>
                      {isCompleted ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs ${isCompleted || isCurrent ? 'text-[#29503c] font-medium' : 'text-[#717973]'}`}>
                      {stage}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setDashboardTab('orders')}
          className="p-4 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#29503c]/5 flex items-center justify-center mb-3">
            <Eye className="h-5 w-5 text-[#29503c]" />
          </div>
          <h4 className="font-medium text-[#29503c] text-sm">View Orders</h4>
          <p className="text-xs text-[#414843] mt-1">Track your website orders</p>
        </button>
        <button
          onClick={() => setDashboardTab('support')}
          className="p-4 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#29503c]/5 flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-[#29503c]" />
          </div>
          <h4 className="font-medium text-[#29503c] text-sm">Get Support</h4>
          <p className="text-xs text-[#414843] mt-1">Create a support ticket</p>
        </button>
        <button
          onClick={() => setDashboardTab('settings')}
          className="p-4 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[#29503c]/5 flex items-center justify-center mb-3">
            <ExternalLink className="h-5 w-5 text-[#29503c]" />
          </div>
          <h4 className="font-medium text-[#29503c] text-sm">Settings</h4>
          <p className="text-xs text-[#414843] mt-1">Manage your account</p>
        </button>
      </div>
    </div>
  )
}
