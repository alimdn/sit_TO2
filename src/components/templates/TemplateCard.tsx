'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Sparkles, Palette, Heart } from 'lucide-react'
import { getStyleForTemplate } from '@/lib/template-styles'
import { useState, useEffect } from 'react'

interface TemplateCardProps {
  template: {
    id: string
    title: string
    description: string
    category: string
    image: string
    featured: boolean
    livePreview?: string
    previewUrl?: string
  }
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { setPreviewTemplate } = useAppStore()

  // Wishlist (favorites) — saved in localStorage so user can return later
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const checkFavorite = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('templateFavorites') || '[]')
        setIsFavorited(favorites.includes(template.id))
      } catch {
        setIsFavorited(false)
      }
    }
    checkFavorite()
    // Listen for updates from other components (e.g., FavoriteButton in preview)
    window.addEventListener('favoritesUpdated', checkFavorite)
    window.addEventListener('storage', checkFavorite)
    return () => {
      window.removeEventListener('favoritesUpdated', checkFavorite)
      window.removeEventListener('storage', checkFavorite)
    }
  }, [template.id])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      const favorites = JSON.parse(localStorage.getItem('templateFavorites') || '[]')
      if (favorites.includes(template.id)) {
        localStorage.setItem('templateFavorites', JSON.stringify(favorites.filter((id: string) => id !== template.id)))
        setIsFavorited(false)
      } else {
        localStorage.setItem('templateFavorites', JSON.stringify([...favorites, template.id]))
        setIsFavorited(true)
      }
      // Notify other components
      window.dispatchEvent(new Event('favoritesUpdated'))
    } catch {
      // localStorage might not be available
    }
  }

  // Get style info (name + colors) for this template
  const style = getStyleForTemplate(template)

  // Category-based subtle gradient overlay (gives each card a unique feel)
  const categoryGradients: Record<string, string> = {
    Education: 'from-[#3b82f6]/15 via-transparent to-[#06b6d4]/10',
    Business: 'from-[#0f172a]/15 via-transparent to-[#416853]/10',
    Portfolio: 'from-[#8b5cf6]/15 via-transparent to-[#ec4899]/10',
    'E-commerce': 'from-[#29503c]/15 via-transparent to-[#34d399]/10',
    Blog: 'from-[#f59e0b]/15 via-transparent to-[#f97316]/10',
    SaaS: 'from-[#6366f1]/15 via-transparent to-[#a855f7]/10',
    Style: 'from-[#ec4899]/15 via-transparent to-[#8b5cf6]/10',
  }
  const gradient = categoryGradients[template.category] || 'from-[#29503c]/10 via-transparent to-[#416853]/10'

  return (
    <div className="group relative rounded-xl bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1.5 flex flex-col">
      {/* Image container with 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#eeeeea] to-[#e5e8eb]">
        {/* Skeleton shimmer while image loads */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#eeeeea] via-[#e5e8eb] to-[#eeeeea] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] group-hover:opacity-0 transition-opacity" />

        {/* Main image with enhanced filters */}
        <img
          src={template.image}
          alt={template.title}
          loading="lazy"
          decoding="async"
          className="relative w-full h-full object-cover object-top transition-all duration-700 ease-out
                     group-hover:scale-110
                     [filter:saturate(1.05)_contrast(1.03)_brightness(1.02)]
                     group-hover:[filter:saturate(1.18)_contrast(1.06)_brightness(1.04)]"
        />

        {/* Subtle category-tinted gradient overlay (adds depth + brand feel) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />

        {/* Bottom vignette for better text legibility when overlaying */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

        {/* Featured badge */}
        {template.featured && (
          <Badge className="absolute top-3 left-3 bg-[#416853] text-[#29503c] hover:bg-[#284e3b] text-xs shadow-md backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Live Preview badge */}
        {(template.livePreview || template.previewUrl) && (
          <Badge className="absolute top-3 right-3 bg-[#29503c]/90 text-white hover:bg-[#284e3b] text-xs shadow-md backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            Live Preview
          </Badge>
        )}

        {/* Wishlist / Favorite button — heart icon on the image */}
        <button
          onClick={toggleFavorite}
          className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-10 ${
            isFavorited
              ? 'bg-[#ef4444] text-white scale-110'
              : 'bg-white/90 text-[#43474d] hover:bg-white hover:scale-110'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Hover overlay with action hint */}
        <div className="absolute inset-0 bg-[#29503c]/0 group-hover:bg-[#29503c]/15 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col bg-white relative">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs bg-[#eeeeea] text-[#414843] hover:bg-[#e5e8eb] w-fit">
            {template.category}
          </Badge>
          {(template.livePreview || template.previewUrl) && (
            <span className="text-[10px] font-medium text-[#29503c] uppercase tracking-wide">
              Demo Available
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[#29503c] mb-2 group-hover:text-[#284e3b] transition-colors">
          {template.title}
        </h3>

        {/* Style summary: style name + color circles */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-[#717973] flex-shrink-0" />
            <span className="text-xs font-medium text-[#43474d]">{style.styleName}</span>
          </div>
          {/* Color circles */}
          <div className="flex items-center gap-1 ml-auto">
            {style.styleColors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-[#c1c8c1] shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-[#414843] line-clamp-2 leading-relaxed flex-1">{template.description}</p>

        {/* Preview button */}
        <Button
          onClick={() => setPreviewTemplate(template.id)}
          className="w-full mt-4 relative overflow-hidden bg-[#29503c] hover:bg-[#284e3b] text-white h-10 text-sm font-medium group/btn transition-colors"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#416853]/0 via-[#416853]/15 to-[#416853]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          <Eye className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Preview Template</span>
        </Button>
      </div>

      {/* Subtle top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#416853] via-[#3b82f6] to-[#416853] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
