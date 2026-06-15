'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, ExternalLink, Sparkles } from 'lucide-react'

interface TemplateCardProps {
  template: {
    id: string
    title: string
    description: string
    category: string
    image: string
    featured: boolean
  }
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { setPreviewTemplate } = useAppStore()

  return (
    <div className="group rounded-xl bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {template.featured && (
          <Badge className="absolute top-3 left-3 bg-[#00D1FF] text-[#000f22] hover:bg-[#00b8e6] text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Live Preview overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000f22]/80 via-[#000f22]/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2.5">
          <Button
            onClick={() => setPreviewTemplate(template.id)}
            className="bg-[#00D1FF] hover:bg-[#00b8e6] text-[#000f22] font-semibold h-9 px-5 text-sm shadow-lg shadow-[#00D1FF]/25 transition-all duration-200 translate-y-3 group-hover:translate-y-0"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          <Button
            onClick={() => setPreviewTemplate(template.id)}
            className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-semibold h-9 px-5 text-sm border border-white/20 transition-all duration-200 translate-y-3 group-hover:translate-y-0"
            style={{ transitionDelay: '50ms' }}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Live Demo
          </Button>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <Badge variant="secondary" className="mb-3 text-xs bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] w-fit">
          {template.category}
        </Badge>
        <h3 className="font-semibold text-[#000f22] mb-2">{template.title}</h3>
        <p className="text-sm text-[#4F5B76] line-clamp-2 leading-relaxed flex-1">{template.description}</p>

        {/* Elegant Live Preview button */}
        <Button
          onClick={() => setPreviewTemplate(template.id)}
          className="w-full mt-4 relative overflow-hidden bg-[#000f22] hover:bg-[#0A2540] text-white h-10 text-sm font-medium group/btn"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/0 via-[#00D1FF]/10 to-[#00D1FF]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
          <Eye className="h-4 w-4 mr-2 relative z-10" />
          <span className="relative z-10">Preview Template</span>
        </Button>
      </div>
    </div>
  )
}
