'use client'

import { Palette, Server, Database, Headphones, CreditCard } from 'lucide-react'

const features = [
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Professional Designs',
    description: 'Stunning, modern templates crafted by expert designers to make your brand stand out.',
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: 'Hosting Included',
    description: 'Fast, secure hosting with SSL certificates and CDN included. No extra costs or setup required.',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Database Setup',
    description: 'Complete database integration and management. We handle the technical complexity for you.',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Technical Support',
    description: 'Dedicated support team available to help with any issues. Priority support on annual plans.',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Subscription Management',
    description: 'Flexible monthly, semi-annual, or annual plans. Easy upgrades, downgrades, and transparent billing.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="label-style text-[#00D1FF] text-xs block mb-3">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#000f22]" style={{ letterSpacing: '-0.02em' }}>
            Everything You Need to Succeed Online
          </h2>
          <p className="mt-4 text-[#4F5B76] max-w-2xl mx-auto">
            Our subscription includes everything from design to deployment, with ongoing support to keep your website running smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#000f22]/5 group-hover:bg-[#00D1FF]/10 flex items-center justify-center text-[#000f22] group-hover:text-[#00D1FF] transition-colors mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-[#000f22] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#4F5B76] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
