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

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data))
      .catch(() => {})
  }, [])

  return (
    <section className="py-20 section-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-[#4F5B76]">
            Find answers to common questions about our subscription service.
          </p>
        </div>

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
    </section>
  )
}
