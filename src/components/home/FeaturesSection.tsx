'use client'

import { Palette, Server, Database, Headphones, CreditCard, Monitor, Smartphone, Search, Zap, Shield, Code, ShoppingCart } from 'lucide-react'

// Left column: Website design & creation services
const designServices = [
  {
    icon: <Palette className="h-5 w-5" />,
    title: 'Professional Design',
    description: 'Stunning, modern templates crafted by expert designers to make your brand stand out.',
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: 'Custom Development',
    description: 'Tailored code and features built specifically for your business needs and goals.',
  },
  {
    icon: <Monitor className="h-5 w-5" />,
    title: 'Responsive Layout',
    description: 'Your website looks perfect on desktop, tablet, and mobile devices.',
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Mobile-First Design',
    description: 'Optimized for mobile users with fast loading and intuitive navigation.',
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: 'SEO Optimized',
    description: 'Built with search engine best practices to help customers find you online.',
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: 'E-Commerce Ready',
    description: 'Store Package includes full shopping cart, product catalog, and checkout.',
  },
]

// Right column: Hosting & management services
const hostingServices = [
  {
    icon: <Server className="h-5 w-5" />,
    title: 'Hosting Included',
    description: 'Fast, secure hosting with SSL certificates and CDN included. No extra costs.',
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: 'Database Setup',
    description: 'Complete database integration and management. We handle the technical complexity.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Security & Backups',
    description: 'Daily backups, SSL encryption, and DDoS protection keep your site safe.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Performance Optimized',
    description: 'CDN, image optimization, and lazy loading for blazing-fast page speeds.',
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    title: 'Technical Support',
    description: 'Dedicated support team available to help with any issues. Priority on annual plans.',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: 'Subscription Management',
    description: 'Flexible monthly, semi-annual, or annual plans. Easy upgrades and transparent billing.',
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

        {/* Two-column layout: Design services | Hosting & Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Website Design & Creation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D1FF] to-[#10B981] flex items-center justify-center">
                <Palette className="h-5 w-5 text-[#000f22]" />
              </div>
              <div>
                <h3 className="font-bold text-[#000f22] text-lg">Website Design & Creation</h3>
                <p className="text-xs text-[#4F5B76]">We design and build your website from scratch</p>
              </div>
            </div>

            {designServices.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-xl bg-[#f7fafd] hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-[#e6ebf1]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/10 group-hover:bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] flex-shrink-0 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#000f22] text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-[#4F5B76] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Hosting & Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#000f22] to-[#0A2540] flex items-center justify-center">
                <Server className="h-5 w-5 text-[#00D1FF]" />
              </div>
              <div>
                <h3 className="font-bold text-[#000f22] text-lg">Hosting & Management</h3>
                <p className="text-xs text-[#4F5B76]">We host, maintain, and support your website</p>
              </div>
            </div>

            {hostingServices.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-xl bg-[#f7fafd] hover:bg-white hover:shadow-card transition-all duration-300 border border-transparent hover:border-[#e6ebf1]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#000f22]/5 group-hover:bg-[#000f22]/10 flex items-center justify-center text-[#000f22] flex-shrink-0 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#000f22] text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-[#4F5B76] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
