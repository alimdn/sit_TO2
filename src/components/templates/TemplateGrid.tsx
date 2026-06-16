'use client'

import { useEffect, useState } from 'react'
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
}

const categories = ['All', 'Education', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'SaaS']

export default function TemplateGrid() {
  const { setCurrentPage } = useAppStore()
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
        setTemplates(list)
      })
      .catch(() => setTemplates([]))
  }, [])

  const filtered = templates.filter(t => {
    const matchCategory = activeCategory === 'All' || t.category === activeCategory
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                       t.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

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
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
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
