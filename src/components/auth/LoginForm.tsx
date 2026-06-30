'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginForm() {
  const { setUser, setCurrentPage } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        if (remember) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        toast.success('Welcome back!')

        // Check if there's a pending checkout — if so, redirect back to checkout
        // instead of dashboard. This fixes the "No checkout data found" error
        // that occurred when a user clicked "Get This Template" without being
        // logged in, got redirected to login, then lost their checkout data.
        const pendingCheckout = typeof window !== 'undefined'
          ? sessionStorage.getItem('pendingCheckout')
          : null

        if (pendingCheckout === 'true') {
          sessionStorage.removeItem('pendingCheckout')
          setCurrentPage('checkout')
        } else {
          setCurrentPage(data.user.role === 'admin' ? 'admin' : 'dashboard')
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#29503c] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#29503c]">Welcome Back</h1>
          <p className="text-sm text-[#414843] mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-[#faf9f6]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-[#416853] hover:underline">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-[#faf9f6] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717973] hover:text-[#29503c]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm text-[#43474d] font-normal cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#29503c] hover:bg-[#284e3b] text-white h-11"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#c1c8c1] text-center">
            <p className="text-sm text-[#414843]">
              Demo accounts available:
            </p>
            <div className="mt-2 space-y-1 text-xs text-[#414843]">
              <p>Admin: admin@webforge.com / admin123</p>
              <p>User: demo@webforge.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
