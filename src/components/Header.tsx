'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Menu, X, LayoutDashboard, Shield, LogOut, ShoppingCart } from 'lucide-react'
import Brand from './Brand'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const DEFAULT_SITE_NAME = 'WebForge'

export default function Header() {
  const { currentPage, setCurrentPage, user, setUser, checkoutData } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [siteName, setSiteName] = useState<string>(DEFAULT_SITE_NAME)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const found = data.find(s => s.key === 'site_name')
        if (found?.value) setSiteName(found.value)
      })
      .catch((e) => console.error('[Header] fetch error:', e))

    // Restore session from HTTP-only cookie on first mount.
    // The cookie itself is not readable from JS (HttpOnly), so we ask the server.
    // This validates that the session is still active server-side.
    fetch('/api/auth', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          try { localStorage.setItem('user', JSON.stringify(data.user)) } catch {}
        } else {
          // Session invalid or expired — clear stale localStorage
          setUser(null)
          try { localStorage.removeItem('user') } catch {}
        }
      })
      .catch((e) => console.error('[Header] session restore error:', e))
  }, [setUser])

  // Use shared Brand component for consistent rendering
  const renderBrand = () => <Brand siteName={siteName} />

  const navItems = [
    { label: 'Home', page: 'home' as const },
    { label: 'Templates', page: 'templates' as const },
    { label: 'Plans', page: 'plans' as const },
    { label: 'Contact', page: 'contact' as const },
  ]

  const handleNav = (page: typeof currentPage) => {
    setCurrentPage(page)
    setMobileOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = async () => {
    // Clear the session cookie server-side
    try { await fetch('/api/auth', { method: 'DELETE' }) } catch {}
    setUser(null)
    setCurrentPage('home')
    localStorage.removeItem('user')
  }

  return (
    <header className="glass-header sticky top-0 z-50 border-b border-[#c1c8c1]" style={{ height: '40px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-[#416853] to-[#29503c] rounded-md flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-[#29503c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l4 16 4-12 4 12 4-16" />
            </svg>
          </div>
          <span className="font-bold text-sm text-[#29503c]">
            {renderBrand()}
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currentPage === item.page
                  ? 'bg-[#29503c] text-white'
                  : 'text-[#43474d] hover:bg-[#eeeeea] hover:text-[#29503c]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => {
              if (checkoutData) {
                setCurrentPage('checkout')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                setCurrentPage('templates')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="relative p-1.5 rounded-lg hover:bg-[#eeeeea] transition-colors group"
            title={checkoutData ? `Cart: ${1 + checkoutData.selectedAddOns.length} items` : 'Browse Templates'}
          >
            <ShoppingCart className="h-4 w-4 text-[#43474d] group-hover:text-[#29503c] transition-colors" />
            {checkoutData && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#416853] text-[#29503c] text-[10px] font-bold px-1 leading-none">
                {1 + checkoutData.selectedAddOns.length}
              </span>
            )}
          </button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#eeeeea] transition-colors">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-[#29503c] text-white text-[9px]">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-[#181c1e]">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleNav('dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleNav('admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => handleNav('login')}
              className="bg-[#29503c] hover:bg-[#284e3b] text-white h-7 text-xs"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Right side mobile */}
        <div className="md:hidden flex items-center gap-2">
          {/* Cart mobile */}
          <button
            onClick={() => {
              if (checkoutData) {
                setCurrentPage('checkout')
                setMobileOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                setCurrentPage('templates')
                setMobileOpen(false)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="relative p-1.5 rounded-lg hover:bg-[#eeeeea] transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-[#43474d]" />
            {checkoutData && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#416853] text-[#29503c] text-[10px] font-bold px-1 leading-none">
                {1 + checkoutData.selectedAddOns.length}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-[#eeeeea] transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-header border-t border-[#c1c8c1] animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'bg-[#29503c] text-white'
                    : 'text-[#43474d] hover:bg-[#eeeeea]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#c1c8c1]">
              {/* Cart in mobile menu */}
              {checkoutData && (
                <button
                  onClick={() => {
                    setCurrentPage('checkout')
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#eeeeea] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>
                  <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-[#416853] text-[#29503c] text-[10px] font-bold px-1.5">
                    {1 + checkoutData.selectedAddOns.length}
                  </span>
                </button>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#eeeeea]"
                  >
                    Dashboard
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNav('admin')}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#eeeeea]"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#fef2f2]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Prominent "Get Started" CTA in mobile menu */}
                  <button
                    onClick={() => handleNav('plans')}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#29503c] text-white hover:bg-[#284e3b] mb-2"
                  >
                    Get Started Now — $30/mo
                  </button>
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-[#29503c] text-white hover:bg-[#284e3b]"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
