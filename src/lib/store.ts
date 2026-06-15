import { create } from 'zustand'

export type Page = 'home' | 'templates' | 'plans' | 'contact' | 'login' | 'dashboard' | 'admin' | 'checkout'
export type DashboardTab = 'overview' | 'orders' | 'support' | 'settings'
export type AdminTab = 'templates' | 'plans' | 'orders' | 'messages' | 'social' | 'payments' | 'settings'

interface AppUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
  phone?: string | null
  company?: string | null
}

export interface CheckoutData {
  templateId: string
  templateTitle: string
  templateImage: string
  templateCategory: string
  templateFeatures: string[]
  billing: 'monthly' | 'annual'
  selectedAddOns: string[]
}

interface AppStore {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  dashboardTab: DashboardTab
  setDashboardTab: (tab: DashboardTab) => void
  adminTab: AdminTab
  setAdminTab: (tab: AdminTab) => void
  selectedTemplate: string | null
  setSelectedTemplate: (id: string | null) => void
  previewTemplate: string | null
  setPreviewTemplate: (id: string | null) => void
  user: AppUser | null
  setUser: (user: AppUser | null) => void
  checkoutData: CheckoutData | null
  setCheckoutData: (data: CheckoutData | null) => void
  showProjectFiles: boolean
  setShowProjectFiles: (show: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'home',
  setCurrentPage: (page) => set({ currentPage: page }),
  dashboardTab: 'overview',
  setDashboardTab: (tab) => set({ dashboardTab: tab }),
  adminTab: 'templates',
  setAdminTab: (tab) => set({ adminTab: tab }),
  selectedTemplate: null,
  setSelectedTemplate: (id) => set({ selectedTemplate: id }),
  previewTemplate: null,
  setPreviewTemplate: (id) => set({ previewTemplate: id }),
  user: null,
  setUser: (user) => set({ user }),
  checkoutData: null,
  setCheckoutData: (data) => set({ checkoutData: data }),
  showProjectFiles: false,
  setShowProjectFiles: (show) => set({ showProjectFiles: show }),
}))
