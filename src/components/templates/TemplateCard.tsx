'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Sparkles, Palette } from 'lucide-react'
import { getStyleForTemplate } from '@/lib/template-styles'

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

  // Get style info (name + colors) for this template
  const style = getStyleForTemplate(template)

  // Category-based subtle gradient overlay (gives each card a unique feel)
  const categoryGradients: Record<string, string> = {
    Education: 'from-[#3b82f6]/15 via-transparent to-[#06b6d4]/10',
    Business: 'from-[#0f172a]/15 via-transparent to-[#00D1FF]/10',
    Portfolio: 'from-[#8b5cf6]/15 via-transparent to-[#ec4899]/10',
    'E-commerce': 'from-[#10B981]/15 via-transparent to-[#34d399]/10',
    Blog: 'from-[#f59e0b]/15 via-transparent to-[#f97316]/10',
    SaaS: 'from-[#6366f1]/15 via-transparent to-[#a855f7]/10',
    Style: 'from-[#ec4899]/15 via-transparent to-[#8b5cf6]/10',
  }
  const gradient = categoryGradients[template.category] || 'from-[#000f22]/10 via-transparent to-[#00D1FF]/10'

  return (
    <div className="group relative rounded-xl bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1.5 flex flex-col">
      {/* Image container with 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#f1f4f7] to-[#e5e8eb]">
        {/* Skeleton shimmer while image loads */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f1f4f7] via-[#e5e8eb] to-[#f1f4f7] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] group-hover:opacity-0 transition-opacity" />

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
          <Badge className="absolute top-3 left-3 bg-[#00D1FF] text-[#000f22] hover:bg-[#00b8e6] text-xs shadow-md backdrop-blur-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Live Preview badge */}
        {(template.livePreview || template.previewUrl) && (
          <Badge className="absolute top-3 right-3 bg-[#10B981]/90 text-white hover:bg-[#059669] text-xs shadow-md backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
            Live Preview
          </Badge>
        )}

        {/* Hover overlay with action hint */}
        <div className="absolute inset-0 bg-[#000f22]/0 group-hover:bg-[#000f22]/15 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col bg-white relative">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] w-fit">
            {template.category}
          </Badge>
          {(template.livePreview || template.previewUrl) && (
            <span className="text-[10px] font-medium text-[#10B981] uppercase tracking-wide">
              Demo Available
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[#000f22] mb-2 group-hover:text-[#0A2540] transition-colors">
          {template.title}
        </h3>

        {/* Style summary: style name + color circles */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-[#74777e] flex-shrink-0" />
            <span className="text-xs font-medium text-[#43474d]">{style.styleName}</span>
          </div>
          {/* Color circles */}
          <div className="flex items-center gap-1 ml-auto">
            {style.styleColors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-[#e6ebf1] shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-[#4F5B76] line-clamp-2 leading-relaxed flex-1">{template.description}</p>

        {/* Preview button */}
        <Button
          onClick={() => setPreviewTemplate(template.id)}
          className="w-full mt-4 relative overflow-hidden bg-[#000f22] hover:bg-[#0A2540] text-white h-10 text-sm font-medium group/btn transition-colors"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/0 via-[#00D1FF]/15 to-[#00D1FF]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          <Eye className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Preview Template</span>
        </Button>
      </div>

      {/* Subtle top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#00D1FF] via-[#3b82f6] to-[#00D1FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}
