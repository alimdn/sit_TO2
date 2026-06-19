'use client'

import { LayoutTemplate, CreditCard, FileText, Rocket } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <LayoutTemplate className="h-6 w-6" />,
    title: 'Choose Template',
    description: 'Browse our collection of professional templates and pick the perfect one for your business. You can also include a link to a similar website to clarify the vision.',
  },
  {
    number: '02',
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Select Plan',
    description: 'Choose between our flexible monthly, semi-annual, or annual subscription plans that fit your budget.',
  },
  {
    number: '03',
    icon: <FileText className="h-6 w-6" />,
    title: 'Submit Requirements',
    description: 'Tell us about your brand, content, and any specific features you need for your website.',
  },
  {
    number: '04',
    icon: <Rocket className="h-6 w-6" />,
    title: 'Receive Website',
    description: 'We build, test, and launch your website. You review and request any final adjustments.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 section-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Get Your Website in 4 Simple Steps
          </h2>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Our streamlined process makes it easy to go from idea to launch in as little as one week.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-[#e6ebf1]" />
              )}
              
              <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-card mb-5">
                <div className="text-[#00D1FF]">{step.icon}</div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#000f22] text-white text-xs flex items-center justify-center font-bold">
                  {step.number}
                </span>
              </div>
              
              <h3 className="font-semibold text-[#000f22] mb-2">{step.title}</h3>
              <p className="text-sm text-[#4F5B76] leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
