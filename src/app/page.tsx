'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FAQSection from '@/components/home/FAQSection'
import TemplateGrid from '@/components/templates/TemplateGrid'
import TemplatePreview from '@/components/templates/TemplatePreview'
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
import AdminSocial from '@/components/admin/AdminSocial'
import AdminPayments from '@/components/admin/AdminPayments'
import AdminSettings from '@/components/admin/AdminSettings'

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
  return (
    <div className="page-enter py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Our Templates</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Browse Website Templates
          </h1>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Choose from our collection of professionally designed templates. Each one is fully customizable to match your brand.
          </p>
        </div>
        <TemplateGrid />
      </div>
      <TemplatePreview />
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
      default: return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafd]">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  )
}
