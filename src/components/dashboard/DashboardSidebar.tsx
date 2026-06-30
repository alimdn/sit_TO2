'use client'

import { useAppStore, type DashboardTab } from '@/lib/store'
import { LayoutDashboard, ShoppingBag, Headphones, Settings } from 'lucide-react'

const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'support', label: 'Support', icon: <Headphones className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
]

export default function DashboardSidebar() {
  const { dashboardTab, setDashboardTab } = useAppStore()

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <nav className="bg-white rounded-xl shadow-card p-2 lg:sticky lg:top-24">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDashboardTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              dashboardTab === tab.id
                ? 'bg-[#29503c] text-white'
                : 'text-[#43474d] hover:bg-[#eeeeea]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
