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

export default function Footer() {
  const { setCurrentPage } = useAppStore()
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    fetch('/api/social')
      .then(res => res.json())
      .then(data => setSocialLinks(data))
      .catch(() => {})
  }, [])

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
                WebFlow<span className="text-[#00D1FF]">Sub</span>
              </span>
            </div>
            <p className="text-[#768dad] text-sm leading-relaxed">
              Professional website design subscription service. Get a stunning website without the upfront cost.
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
              <li>support@webflowsub.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Design Street<br />San Francisco, CA 94102</li>
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
            </div>
          </div>
        </div>

        <div className="border-t border-[#0A2540] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#768dad]">
            © {new Date().getFullYear()} WebFlowSub. All rights reserved.
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
