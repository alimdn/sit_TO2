'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Menu, X, LayoutDashboard, Shield, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Header() {
  const { currentPage, setCurrentPage, user, setUser } = useAppStore()
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
    <header className="glass-header sticky top-0 z-50 border-b border-[#e6ebf1]" style={{ height: '54px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 bg-[#000f22] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">W</span>
          </div>
          <span className="font-bold text-base text-[#000f22]">
            WebFlow<span className="text-[#00D1FF]">Sub</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[#f1f4f7] transition-colors">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-[#000f22] text-white text-[10px]">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-[#181c1e]">{user.name}</span>
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
              className="bg-[#000f22] hover:bg-[#0A2540] text-white h-8 text-sm"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-[#f1f4f7] transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
