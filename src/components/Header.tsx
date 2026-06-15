'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Menu, X, LayoutDashboard, Shield, LogOut, ShoppingCart, FolderOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Header() {
  const { currentPage, setCurrentPage, user, setUser, checkoutData, setShowProjectFiles } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('home')
    localStorage.removeItem('user')
  }

  return (
    <header className="glass-header sticky top-0 z-50 border-b border-[#e6ebf1]" style={{ height: '40px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 bg-[#000f22] rounded flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">W</span>
          </div>
          <span className="font-bold text-sm text-[#000f22]">
            WebFlow<span className="text-[#00D1FF]">Sub</span>
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
                  ? 'bg-[#000f22] text-white'
                  : 'text-[#43474d] hover:bg-[#f1f4f7] hover:text-[#000f22]'
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
            className="relative p-1.5 rounded-lg hover:bg-[#f1f4f7] transition-colors group"
            title={checkoutData ? `Cart: ${1 + checkoutData.selectedAddOns.length} items` : 'Browse Templates'}
          >
            <ShoppingCart className="h-4 w-4 text-[#43474d] group-hover:text-[#000f22] transition-colors" />
            {checkoutData && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#00D1FF] text-[#000f22] text-[10px] font-bold px-1 leading-none">
                {1 + checkoutData.selectedAddOns.length}
              </span>
            )}
          </button>
          {/* Project Files */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowProjectFiles(true)}
              className="relative p-1.5 rounded-lg hover:bg-[#f1f4f7] transition-colors group"
              title="Project Files"
            >
              <FolderOpen className="h-4 w-4 text-[#43474d] group-hover:text-[#000f22] transition-colors" />
            </button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#f1f4f7] transition-colors">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-[#000f22] text-white text-[9px]">
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
              className="bg-[#000f22] hover:bg-[#0A2540] text-white h-7 text-xs"
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
            className="relative p-1.5 rounded-lg hover:bg-[#f1f4f7] transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-[#43474d]" />
            {checkoutData && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#00D1FF] text-[#000f22] text-[10px] font-bold px-1 leading-none">
                {1 + checkoutData.selectedAddOns.length}
              </span>
            )}
          </button>

          {/* Project Files mobile */}
          {user?.role === 'admin' && (
            <button
              onClick={() => { setShowProjectFiles(true); setMobileOpen(false) }}
              className="relative p-1.5 rounded-lg hover:bg-[#f1f4f7] transition-colors"
              title="Project Files"
            >
              <FolderOpen className="h-4 w-4 text-[#43474d]" />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-[#f1f4f7] transition-colors"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass-header border-t border-[#e6ebf1] animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'bg-[#000f22] text-white'
                    : 'text-[#43474d] hover:bg-[#f1f4f7]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#e6ebf1]">
              {/* Cart in mobile menu */}
              {checkoutData && (
                <button
                  onClick={() => {
                    setCurrentPage('checkout')
                    setMobileOpen(false)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#f1f4f7] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                  </span>
                  <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-[#00D1FF] text-[#000f22] text-[10px] font-bold px-1.5">
                    {1 + checkoutData.selectedAddOns.length}
                  </span>
                </button>
              )}
              {/* Project Files in mobile menu */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => { setShowProjectFiles(true); setMobileOpen(false) }}
                  className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#f1f4f7] flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Project Files
                </button>
              )}
              {user ? (
                <>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#f1f4f7]"
                  >
                    Dashboard
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNav('admin')}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-[#43474d] hover:bg-[#f1f4f7]"
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
                <button
                  onClick={() => handleNav('login')}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-[#000f22] text-white hover:bg-[#0A2540]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
