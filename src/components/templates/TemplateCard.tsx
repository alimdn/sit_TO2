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
    <div className="group rounded-xl bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
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
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <Badge variant="secondary" className="mb-3 text-xs bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb] w-fit">
          {template.category}
        </Badge>
        <h3 className="font-semibold text-[#000f22] mb-2">{template.title}</h3>
        <p className="text-sm text-[#4F5B76] line-clamp-2 leading-relaxed flex-1">{template.description}</p>

        {/* Preview button at the bottom */}
        <Button
          onClick={() => setPreviewTemplate(template.id)}
          className="w-full mt-4 bg-[#000f22] hover:bg-[#0A2540] text-white h-10 text-sm font-medium"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Template
        </Button>
      </div>
    </div>
  )
}
