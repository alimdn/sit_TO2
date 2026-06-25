'use client'

import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQ {
  id: string
  question: string
  answer: string
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [faqImage, setFaqImage] = useState<string>('')

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data))
      .catch((e) => console.error('[FAQSection] faqs fetch error:', e))

    // Load the configurable FAQ image (admin key: home_faq_image)
    fetch('/api/settings')
      .then(res => res.json())
      .then((data: { key: string; value: string }[]) => {
        const found = data.find(s => s.key === 'home_faq_image')
        if (found?.value) setFaqImage(found.value)
      })
      .catch((e) => console.error('[FAQSection] settings fetch error:', e))
  }, [])

  const imgSrc = faqImage || '/images/home/faq-default.png'

  return (
    <section className="py-20 section-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-[#4F5B76]">
            Find answers to common questions about our subscription service.
          </p>
        </div>

        {/* Two-column layout: image (left) + accordion (right) on lg+, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Side image — configurable via admin (key: home_faq_image) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-card border border-[#e6ebf1] bg-white">
              <img
                src={imgSrc}
                alt="WebForge — FAQ illustration"
                className="w-full h-72 lg:h-[480px] object-cover"
                loading="lazy"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = '/images/home/faq-default.png'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000f22]/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/85 backdrop-blur-sm rounded-xl p-3 border border-white/50">
                <div className="text-sm font-bold text-[#000f22]">Still have questions?</div>
                <div className="text-xs text-[#4F5B76] mt-1">Our team is one message away — reach out via the Contact page.</div>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className={index < faqs.length - 1 ? 'border-b border-[#e6ebf1]' : ''}
                  >
                    <AccordionTrigger className="px-6 py-4 text-left text-sm font-medium text-[#000f22] hover:no-underline hover:bg-[#f7fafd] transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-sm text-[#4F5B76] leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
