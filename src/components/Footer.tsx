'use client'

import { useAppStore } from '@/lib/store'
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'
import Brand from './Brand'

interface SocialLink {
  id: string
  platform: string
  url: string
  active: boolean
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
}

// Default values used when settings are missing or DB is unreachable.
const DEFAULTS = {
  site_name: 'WebForge',
  site_description: 'We design, host, and maintain your website for a flat monthly fee. No upfront cost, no long-term contracts.',
  contact_email: 'support@webforge.com',
  contact_address: '',  // Removed fake address — set real one via admin panel
}

export default function Footer() {
  const { setCurrentPage } = useAppStore()
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/social')
      .then(res => res.json())
      .then(data => setSocialLinks(data))
      .catch((e) => console.error('[Footer] fetch error:', e))

    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch((e) => console.error('[Footer] fetch error:', e))
  }, [])

  const siteName = settings.site_name || DEFAULTS.site_name
  const siteDesc = settings.site_description || DEFAULTS.site_description
  const contactEmail = settings.contact_email || DEFAULTS.contact_email
  const contactAddressRaw = settings.contact_address || DEFAULTS.contact_address

  // Use shared Brand component for consistent rendering
  const renderBrand = () => <Brand siteName={siteName} />

  const handleNav = (page: 'home' | 'templates' | 'plans' | 'contact' | 'about' | 'privacy' | 'terms' | 'support') => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#29503c] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#416853] to-[#29503c] rounded-lg flex items-center justify-center">
                <span className="text-[#29503c] font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-lg">
                {renderBrand()}
              </span>
            </div>
            <p className="text-[#717973] text-sm leading-relaxed">
              {siteDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#717973] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {(['home', 'templates', 'plans', 'contact'] as const).map((page) => (
                <li key={page}>
                  <button
                    onClick={() => handleNav(page)}
                    className="text-sm text-[#717973] hover:text-white transition-colors capitalize"
                  >
                    {page === 'home' ? 'Home' : page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#717973] mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-[#717973]">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors">About Us</button>
              </li>
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              </li>
              <li>
                <button onClick={() => handleNav('support')} className="hover:text-white transition-colors">Support Center</button>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
              {contactAddressRaw && (
                <li className="whitespace-pre-line">{contactAddressRaw}</li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#717973] mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.filter(l => l.active).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#284e3b] hover:bg-[#416853] hover:text-[#29503c] flex items-center justify-center transition-colors text-[#717973]"
                >
                  {platformIcons[link.platform] || null}
                </a>
              ))}
              {socialLinks.filter(l => l.active).length === 0 && (
                <p className="text-xs text-[#717973]">No social links configured.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#284e3b] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#717973]">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#717973]">
            <button onClick={() => handleNav('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => handleNav('terms')} className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
