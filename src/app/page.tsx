'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { useAppStore } from '@/lib/store'
import { X, AlertTriangle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FAQSection from '@/components/home/FAQSection'
import TemplateGrid from '@/components/templates/TemplateGrid'
import PlansPage from '@/components/plans/PlansPage'
import ContactForm from '@/components/contact/ContactForm'
import LoginForm from '@/components/auth/LoginForm'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import OrdersPage from '@/components/dashboard/OrdersPage'
import SupportCenter from '@/components/dashboard/SupportCenter'
import DashboardSettings from '@/components/dashboard/DashboardSettings'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTemplates from '@/components/admin/AdminTemplates'
import AdminPlans from '@/components/admin/AdminPlans'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminMessages from '@/components/admin/AdminMessages'
import AdminTestimonials from '@/components/admin/AdminTestimonials'
import AdminSocial from '@/components/admin/AdminSocial'
import AdminPayments from '@/components/admin/AdminPayments'
import AdminSettings from '@/components/admin/AdminSettings'
import CheckoutPage from '@/components/checkout/CheckoutPage'
import { Button } from '@/components/ui/button'

// Lazy-load TemplatePreview — it's 948 lines and only needed when a user
// clicks "Preview Template". Loading it eagerly adds ~50KB to the main
// bundle and slows down the initial page render.
const TemplatePreview = lazy(() => import('@/components/templates/TemplatePreview'))

function HomePage() {
  return (
    <div className="page-enter">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
    </div>
  )
}

function TemplatesPage() {
  const { setPreviewTemplate } = useAppStore()
  const [templateCount, setTemplateCount] = useState<number | null>(null)

  // Clear preview state when leaving templates page
  useEffect(() => {
    return () => { setPreviewTemplate(null) }
  }, [setPreviewTemplate])

  // Fetch total templates count for the counter badge
  useEffect(() => {
    fetch('/api/templates', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setTemplateCount(data.length)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page-enter py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Our Templates</span>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
              Browse Website Templates
            </h1>
            {templateCount !== null && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-[#000f22] text-white shadow-card"
                title={`${templateCount} templates available`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                {templateCount}
              </span>
            )}
          </div>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Choose from our collection of professionally designed templates. Each one is fully customizable to match your brand.
          </p>
        </div>
        <TemplateGrid />
      </div>
      <Suspense fallback={<div className="fixed inset-0 z-50 bg-[#f7fafd] flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#00D1FF] border-t-transparent rounded-full animate-spin" /></div>}>
        <TemplatePreview />
      </Suspense>
    </div>
  )
}

function PlansPageRoute() {
  return (
    <div className="page-enter py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PlansPage />
      </div>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="page-enter py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Contact Us
          </h1>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Have a question or need help? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  )
}

function LoginPage() {
  return (
    <div className="page-enter">
      <LoginForm />
    </div>
  )
}

function CheckoutPageRoute() {
  const { user, setCurrentPage } = useAppStore()

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF8E1] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-[#000f22] mb-2">Sign In Required</h2>
          <p className="text-[#4F5B76] mb-6">You need to create an account or sign in to complete your purchase and proceed to payment.</p>
          <Button
            onClick={() => setCurrentPage('login')}
            className="bg-[#000f22] hover:bg-[#0A2540] text-white font-semibold h-11 px-8"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutPage />
      </div>
    </div>
  )
}

function DashboardPage() {
  const { user, setCurrentPage, dashboardTab } = useAppStore()

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4F5B76] mb-4">Please sign in to access your dashboard.</p>
          <button
            onClick={() => setCurrentPage('login')}
            className="text-[#00D1FF] font-medium hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (dashboardTab) {
      case 'overview': return <DashboardOverview />
      case 'orders': return <OrdersPage />
      case 'support': return <SupportCenter />
      case 'settings': return <DashboardSettings />
      default: return <DashboardOverview />
    }
  }

  return (
    <div className="page-enter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebar />
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminPage() {
  const { user, setCurrentPage, adminTab } = useAppStore()

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4F5B76] mb-4">You don&apos;t have access to the admin panel.</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="text-[#00D1FF] font-medium hover:underline"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (adminTab) {
      case 'templates': return <AdminTemplates />
      case 'plans': return <AdminPlans />
      case 'orders': return <AdminOrders />
      case 'messages': return <AdminMessages />
      case 'testimonials': return <AdminTestimonials />
      case 'social': return <AdminSocial />
      case 'payments': return <AdminPayments />
      case 'settings': return <AdminSettings />
      default: return <AdminTemplates />
    }
  }

  return (
    <div className="page-enter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar />
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { currentPage, setUser } = useAppStore()

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [setUser])

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'templates': return <TemplatesPage />
      case 'plans': return <PlansPageRoute />
      case 'contact': return <ContactPage />
      case 'login': return <LoginPage />
      case 'dashboard': return <DashboardPage />
      case 'admin': return <AdminPage />
      case 'checkout': return <CheckoutPageRoute />
      default: return <HomePage />
    }
  }

  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafd]">
      {/* E-commerce Suspension Alert Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] text-white relative z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 animate-pulse" />
            <p className="text-sm font-medium text-center">
              <span className="font-bold">Notice:</span> E-commerce services are temporarily suspended.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}
