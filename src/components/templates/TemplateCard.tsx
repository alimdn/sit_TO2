'use client'

import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'

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
    <div className="group rounded-xl bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={template.image}
          alt={template.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {template.featured && (
          <Badge className="absolute top-3 left-3 bg-[#00D1FF] text-[#000f22] hover:bg-[#00b8e6] text-xs">
            Featured
          </Badge>
        )}
        <div className="absolute inset-0 bg-[#000f22]/0 group-hover:bg-[#000f22]/40 transition-colors flex items-center justify-center">
          <Button
            onClick={() => setPreviewTemplate(template.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#000f22] hover:bg-[#f1f4f7] h-10"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Template
          </Button>
        </div>
      </div>
      <div className="p-5">
        <Badge variant="secondary" className="mb-3 text-xs bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb]">
          {template.category}
        </Badge>
        <h3 className="font-semibold text-[#000f22] mb-2">{template.title}</h3>
        <p className="text-sm text-[#4F5B76] line-clamp-2 leading-relaxed">{template.description}</p>
      </div>
    </div>
  )
}
