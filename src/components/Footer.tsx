'use client'

import { useAppStore } from '@/lib/store'
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  site_name: 'WebFlowSub',
  site_description: 'Professional website design subscription service. Get a stunning website without the upfront cost.',
  contact_email: 'support@webflowsub.com',
  contact_address: '123 Design Street\nSan Francisco, CA 94102',
}

export default function Footer() {
  const { setCurrentPage } = useAppStore()
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/social')
      .then(res => res.json())
      .then(data => setSocialLinks(data))
      .catch(() => {})

    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      })
      .catch(() => {})
  }, [])

  const siteName = settings.site_name || DEFAULTS.site_name
  const siteDesc = settings.site_description || DEFAULTS.site_description
  const contactEmail = settings.contact_email || DEFAULTS.contact_email
  const contactAddress = (settings.contact_address || DEFAULTS.contact_address).replace(/\n/g, '<br />')

  // Split brand name to highlight suffix (e.g. "WebFlowSub" → "WebFlow" + "Sub")
  // If the name contains "Sub", highlight it; otherwise highlight last 3 chars.
  const renderBrand = () => {
    if (siteName.toLowerCase().endsWith('sub')) {
      const prefix = siteName.slice(0, -3)
      const suffix = siteName.slice(-3)
      return <>{prefix}<span className="text-[#00D1FF]">{suffix}</span></>
    }
    return siteName
  }

  const handleNav = (page: 'home' | 'templates' | 'plans' | 'contact') => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#000f22] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#00D1FF] rounded-lg flex items-center justify-center">
                <span className="text-[#000f22] font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-lg">
                {renderBrand()}
              </span>
            </div>
            <p className="text-[#768dad] text-sm leading-relaxed">
              {siteDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#768dad] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {(['home', 'templates', 'plans', 'contact'] as const).map((page) => (
                <li key={page}>
                  <button
                    onClick={() => handleNav(page)}
                    className="text-sm text-[#768dad] hover:text-white transition-colors capitalize"
                  >
                    {page === 'home' ? 'Home' : page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#768dad] mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-[#768dad]">
              <li>
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
              <li dangerouslySetInnerHTML={{ __html: contactAddress }} />
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm label-style text-[#768dad] mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.filter(l => l.active).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#0A2540] hover:bg-[#00D1FF] hover:text-[#000f22] flex items-center justify-center transition-colors text-[#768dad]"
                >
                  {platformIcons[link.platform] || null}
                </a>
              ))}
              {socialLinks.filter(l => l.active).length === 0 && (
                <p className="text-xs text-[#768dad]">No social links configured.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#0A2540] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#768dad]">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-[#768dad]">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
