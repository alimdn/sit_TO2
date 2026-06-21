'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import TemplateCard from './TemplateCard'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Template {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string
  industries: string
  featured: boolean
  active: boolean
  previewUrl?: string
  livePreview?: string
}

const categories = ['All', 'Education', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'SaaS']

export default function TemplateGrid() {
  const { setCurrentPage } = useAppStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(12) // Start with 12, load more on scroll
  const lastFetchRef = useRef<number>(0)

  // Always fetch fresh templates (bypassing browser cache) so the public
  // Templates page reflects admin changes (active/inactive toggles) immediately.
  // We re-fetch on mount, on window focus (when user returns from another tab),
  // and on visibility change (when user returns to this tab from another).
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Use cache-busting query param + no-store headers
        const res = await fetch(`/api/templates?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
        const data = await res.json()
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        // Defensive: only show active templates (in case the API returns all)
        const activeList = list.filter((t: Template) => t.active !== false)
        setTemplates(activeList)
        lastFetchRef.current = Date.now()
      } catch {
        setTemplates([])
      }
    }

    fetchTemplates()

    // Re-fetch when the tab becomes visible again (user navigated away and came back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only re-fetch if it's been more than 5 seconds since the last fetch
        if (Date.now() - lastFetchRef.current > 5000) {
          fetchTemplates()
        }
      }
    }

    // Re-fetch when the window regains focus (user switched tabs/windows)
    const handleFocus = () => {
      if (Date.now() - lastFetchRef.current > 5000) {
        fetchTemplates()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const filtered = templates.filter(t => {
    const matchCategory = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                       t.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  // Only render the first `visibleCount` templates — pagination/infinite scroll
  const visibleTemplates = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#74777e]" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#000f22] text-white'
                  : 'bg-white text-[#43474d] hover:bg-[#f1f4f7] shadow-card'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {visibleTemplates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-10">
              <Button
                onClick={() => setVisibleCount(prev => prev + 12)}
                variant="outline"
                className="border-[#000f22] text-[#000f22] hover:bg-[#000f22] hover:text-white h-11 px-8"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#4F5B76] text-lg">No templates found matching your criteria.</p>
        </div>
      )}

      {/* Custom template CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#000f22] to-[#0A2540] p-8 sm:p-12 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Need a Custom Template?</h3>
        <p className="text-[#768dad] max-w-lg mx-auto mb-6">
          Can&apos;t find what you&apos;re looking for? Our design team can create a custom template tailored to your specific needs.
        </p>
        <Button
          onClick={() => {
            setCurrentPage('contact')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-11 px-8"
        >
          Contact Us
        </Button>
      </div>
    </div>
  )
}
