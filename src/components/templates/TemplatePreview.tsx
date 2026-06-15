'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight } from 'lucide-react'

interface Template {
  id: string
  title: string
  description: string
  category: string
  image: string
  features: string
  industries: string
  featured: boolean
}

export default function TemplatePreview() {
  const { previewTemplate, setPreviewTemplate, setCurrentPage } = useAppStore()
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (!previewTemplate) return
    let cancelled = false
    fetch(`/api/templates/${previewTemplate}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setTemplate(data) })
      .catch(() => { if (!cancelled) setTemplate(null) })
    return () => { cancelled = true; setTemplate(null) }
  }, [previewTemplate])

  const features: string[] = template?.features ? JSON.parse(template.features) : []
  const industries: string[] = template?.industries ? JSON.parse(template.industries) : []

  return (
    <Sheet open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {template && (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="text-left">{template.title}</SheetTitle>
            </SheetHeader>

            <div className="space-y-6">
              {/* Preview image */}
              <div className="rounded-xl overflow-hidden border border-[#e6ebf1]">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full object-cover"
                />
              </div>

              {/* Category & featured */}
              <div className="flex items-center gap-2">
                <Badge className="bg-[#f1f4f7] text-[#4F5B76] hover:bg-[#e5e8eb]">
                  {template.category}
                </Badge>
                {template.featured && (
                  <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] hover:bg-[#00D1FF]/20">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#4F5B76] leading-relaxed">{template.description}</p>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-[#000f22] mb-3">Features Included</h4>
                <div className="space-y-2">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-[#10B981]" />
                      </div>
                      <span className="text-sm text-[#43474d]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <h4 className="font-semibold text-[#000f22] mb-3">Suitable For</h4>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-[#e6ebf1] text-[#4F5B76]">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-[#e6ebf1]">
                <Button
                  onClick={() => {
                    setPreviewTemplate(null)
                    setCurrentPage('plans')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="w-full bg-[#000f22] hover:bg-[#0A2540] text-white h-11"
                >
                  Subscribe Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
