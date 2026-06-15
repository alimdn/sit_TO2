'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string | null
  content: string
  rating: number
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(() => {})
  }, [])

  const colors = ['#00D1FF', '#10B981', '#0A2540', '#768dad']

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            What Our Clients Say
          </h2>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Join hundreds of satisfied customers who have transformed their online presence with WebFlowSub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="p-6 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-[#c4c6ce]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[#43474d] text-sm leading-relaxed mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#e6ebf1]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: colors[index % colors.length] }}
                >
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium text-sm text-[#000f22]">{testimonial.name}</div>
                  <div className="text-xs text-[#4F5B76]">
                    {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
