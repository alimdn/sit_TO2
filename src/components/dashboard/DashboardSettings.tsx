'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function DashboardSettings() {
  const { user, setUser } = useAppStore()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  })

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  const handleProfileSave = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/auth/register`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profile }),
      })
      if (res.ok) {
        const data = await res.json()
        setUser({ ...user, ...profile })
        localStorage.setItem('user', JSON.stringify({ ...user, ...profile }))
        toast.success('Profile updated successfully')
      }
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Please fill in all password fields')
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match')
      return
    }
    if (!user) return
    try {
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: passwords.current, newPassword: passwords.newPass }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Password changed successfully')
        setPasswords({ current: '', newPass: '', confirm: '' })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch {
      toast.error('Failed to change password')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#000f22]">Settings</h2>

      {/* Profile */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-[#f7fafd]"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-[#f7fafd]"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-[#f7fafd]"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="bg-[#f7fafd]"
                placeholder="Your company name"
              />
            </div>
          </div>
          <Button onClick={handleProfileSave} className="bg-[#000f22] hover:bg-[#0A2540] text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="bg-[#f7fafd]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                className="bg-[#f7fafd]"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="bg-[#f7fafd]"
              />
            </div>
          </div>
          <Button onClick={handlePasswordChange} className="bg-[#000f22] hover:bg-[#0A2540] text-white">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Account preferences */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Account Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-[#f7fafd] rounded-xl">
            <div>
              <p className="font-medium text-[#000f22] text-sm">Email Notifications</p>
              <p className="text-xs text-[#4F5B76] mt-0.5">Receive updates about your orders and subscriptions</p>
            </div>
            <Button variant="outline" size="sm" className="border-[#e6ebf1]">
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
