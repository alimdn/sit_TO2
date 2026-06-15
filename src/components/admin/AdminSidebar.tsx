'use client'

import { useAppStore, type AdminTab } from '@/lib/store'
import { LayoutTemplate, CreditCard, ShoppingBag, MessageSquare, Share2, Wallet, Settings } from 'lucide-react'

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="h-4 w-4" /> },
  { id: 'plans', label: 'Plans', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingBag className="h-4 w-4" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'social', label: 'Social Links', icon: <Share2 className="h-4 w-4" /> },
  { id: 'payments', label: 'Payments', icon: <Wallet className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
]

export default function AdminSidebar() {
  const { adminTab, setAdminTab } = useAppStore()

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <nav className="bg-white rounded-xl shadow-card p-2 lg:sticky lg:top-24">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              adminTab === tab.id
                ? 'bg-[#000f22] text-white'
                : 'text-[#43474d] hover:bg-[#f1f4f7]'
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
