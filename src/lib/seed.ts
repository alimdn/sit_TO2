import { db } from './db'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  // Check if already seeded
  const userCount = await db.user.count()
  if (userCount > 0) return

  // Create admin and demo users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const demoPassword = await bcrypt.hash('demo123', 10)

  const admin = await db.user.create({
    data: {
      email: 'admin@webforge.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  })

  const demo = await db.user.create({
    data: {
      email: 'demo@webforge.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'user',
      phone: '+1 (555) 123-4567',
      company: 'Acme Inc.',
    },
  })

  // Create subscription plans
  const monthlyPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Monthly',
      price: 30,
      currency: 'USD',
      interval: 'monthly',
      features: JSON.stringify([
        'Professional website design',
        'Responsive mobile layout',
        'SSL certificate included',
        'Free domain (1 year)',
        '5 GB hosting storage',
        'Monthly design updates',
        'Email support',
        'Basic SEO optimization',
      ]),
      popular: false,
      active: true,
    },
  })

  const semiAnnualPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Semi-Annual',
      price: 160,
      currency: 'USD',
      interval: 'semi_annual',
      features: JSON.stringify([
        'Everything in Monthly, plus:',
        'Priority design revisions',
        'Custom domain setup',
        '20 GB hosting storage',
        'Bi-monthly design updates',
        'Priority email support',
        'Advanced SEO optimization',
        'Save $20 vs monthly',
      ]),
      popular: false,
      active: true,
    },
  })

  const annualPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Annual',
      price: 300,
      currency: 'USD',
      interval: 'annual',
      features: JSON.stringify([
        'Everything in Semi-Annual, plus:',
        '50 GB hosting storage',
        'Weekly design updates',
        'Priority 24/7 support',
        'Advanced SEO & analytics',
        'E-commerce integration',
        'Database setup & management',
        'Dedicated project manager',
        '2 months free',
      ]),
      popular: true,
      active: true,
    },
  })

  // Store Package plans (3 variants)
  const storeMonthlyPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Store Package',
      price: 100,
      currency: 'USD',
      interval: 'store',
      features: JSON.stringify([
        'Everything in Annual Plan, plus:',
        'Daily automated backups (vs weekly in lower tiers)',
        'Full e-commerce / store functionality',
        'Unlimited products & categories',
        'Payment gateway integration (Stripe / PayPal)',
        'Inventory management dashboard',
        'Order tracking & customer accounts',
        '100 GB hosting storage',
        'Priority 24/7 support with dedicated manager',
        'Advanced SEO & analytics dashboard',
        'Same 5-7 business days delivery',
        'All previous services included',
      ]),
      popular: false,
      active: true,
    },
  })

  const storeSemiAnnualPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Store Package (Semi-Annual)',
      price: 550,
      currency: 'USD',
      interval: 'store_semi_annual',
      features: JSON.stringify([
        'Everything in Store Monthly, plus:',
        'Save $50 vs paying monthly',
        'Daily automated backups',
        'Full e-commerce / store functionality',
        'Unlimited products & categories',
        'Payment gateway integration (Stripe / PayPal)',
        'Inventory management dashboard',
        'Order tracking & customer accounts',
        '100 GB hosting storage',
        'Priority 24/7 support with dedicated manager',
        'Same 5-7 business days delivery',
      ]),
      popular: false,
      active: true,
    },
  })

  const storeAnnualPlan = await db.subscriptionPlan.create({
    data: {
      name: 'Store Package (Annual)',
      price: 1100,
      currency: 'USD',
      interval: 'store_annual',
      features: JSON.stringify([
        'Everything in Store Semi-Annual, plus:',
        'Save $100 vs paying monthly',
        'Best value for Store Package',
        'Daily automated backups',
        'Full e-commerce / store functionality',
        'Unlimited products & categories',
        'Payment gateway integration (Stripe / PayPal)',
        'Inventory management dashboard',
        'Order tracking & customer accounts',
        '100 GB hosting storage',
        'Priority 24/7 support with dedicated manager',
        'Same 5-7 business days delivery',
      ]),
      popular: false,
      active: true,
    },
  })

  // Create templates
  const templates = [
    {
      title: 'Business Pro',
      description: 'A sleek, modern template designed for corporate websites and business portfolios. Features clean layouts, professional typography, and conversion-optimized landing pages.',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      features: JSON.stringify(['Responsive Design', 'SEO Optimized', 'Contact Forms', 'Analytics Integration', 'Multi-page Layout', 'Newsletter Signup']),
      industries: JSON.stringify(['Consulting', 'Finance', 'Insurance', 'Real Estate']),
      featured: true,
      active: true,
    },
    {
      title: 'Creative Portfolio',
      description: 'Showcase your creative work with this stunning portfolio template. Features elegant gallery layouts, smooth animations, and a minimalist aesthetic.',
      category: 'Portfolio',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      features: JSON.stringify(['Image Gallery', 'Video Support', 'Smooth Animations', 'Project Pages', 'About Section', 'Client Testimonials']),
      industries: JSON.stringify(['Photography', 'Design', 'Art', 'Freelance']),
      featured: true,
      active: true,
    },
    {
      title: 'ShopFront',
      description: 'Launch your online store with this feature-rich e-commerce template. Complete with product pages, shopping cart, and seamless checkout flow.',
      category: 'E-commerce',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      features: JSON.stringify(['Product Catalog', 'Shopping Cart', 'Secure Checkout', 'Inventory Management', 'Customer Reviews', 'Payment Integration']),
      industries: JSON.stringify(['Retail', 'Fashion', 'Electronics', 'Food & Beverage']),
      featured: true,
      active: true,
    },
    {
      title: 'Blog Master',
      description: 'A clean, content-focused blog template with beautiful typography, reading modes, and social sharing capabilities.',
      category: 'Blog',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
      features: JSON.stringify(['Content Management', 'Categories & Tags', 'Social Sharing', 'Comments System', 'Search Functionality', 'RSS Feed']),
      industries: JSON.stringify(['Media', 'Publishing', 'Personal Blog', 'News']),
      featured: false,
      active: true,
    },
    {
      title: 'SaaS Dashboard',
      description: 'Perfect for SaaS products and web applications. Includes dashboard layouts, data visualization components, and user management interfaces.',
      category: 'SaaS',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      features: JSON.stringify(['Dashboard Layout', 'Data Visualization', 'User Management', 'API Integration', 'Authentication', 'Billing Pages']),
      industries: JSON.stringify(['Technology', 'Startups', 'Fintech', 'HealthTech']),
      featured: true,
      active: true,
    },
    {
      title: 'Corporate Elite',
      description: 'A premium corporate template with professional layouts, team pages, and service showcases. Ideal for established businesses.',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800',
      features: JSON.stringify(['Team Pages', 'Service Showcases', 'Case Studies', 'Client Portal', 'Multi-language', 'CRM Integration']),
      industries: JSON.stringify(['Enterprise', 'Legal', 'Healthcare', 'Education']),
      featured: false,
      active: true,
    },
    {
      title: 'Restaurant Hub',
      description: 'A delicious template for restaurants and cafes. Features menu displays, reservation systems, and mouth-watering gallery layouts.',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800',
      features: JSON.stringify(['Menu Display', 'Online Reservations', 'Photo Gallery', 'Location Map', 'Opening Hours', 'Online Ordering']),
      industries: JSON.stringify(['Restaurant', 'Cafe', 'Bakery', 'Catering']),
      featured: false,
      active: true,
    },
    {
      title: 'TechLaunch',
      description: 'A cutting-edge template for tech startups and product launches. Features bold hero sections, feature grids, and pricing tables.',
      category: 'SaaS',
      image: 'https://images.unsplash.com/photo-1576153192396-180ecef2a749?w=800',
      features: JSON.stringify(['Landing Pages', 'Feature Grid', 'Pricing Tables', 'Waitlist Signup', 'Product Demo', 'Documentation']),
      industries: JSON.stringify(['AI & ML', 'Blockchain', 'Cloud Services', 'DevTools']),
      featured: false,
      active: true,
    },
    {
      title: 'EduMentor — Course Platform',
      description: 'A comprehensive e-learning platform template for selling online courses. Features include course cards with category filtering, interactive syllabus with accordion modules, quiz system with instant feedback, progress tracking with visual charts, instructor profiles, course detail modal with cart, and a complete pricing section. Built with Tailwind CSS and fully responsive design. Perfect for online academies, training centers, and educational institutions.',
      category: 'Education',
      image: '/images/template-education.png',
      previewUrl: '/templates/edumentor-course-platform.html',
      features: JSON.stringify(['Video Course Player', 'Interactive Syllabus', 'Quiz System', 'Progress Tracking', 'Student Dashboard', 'Instructor Profiles', 'Course Filtering', 'Responsive Design', 'Accordion Modules', 'Course Modal']),
      industries: JSON.stringify(['Education', 'E-Learning', 'Training', 'Academy', 'Online Courses', 'Corporate Training']),
      livePreview: '/templates/edumentor-course-platform.html',
      featured: true,
      active: true,
    },
  ]

  for (const template of templates) {
    await db.template.create({ data: template })
  }

  // Create testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO',
      company: 'TechStart Inc.',
      content: 'WebForge transformed our online presence completely. The subscription model makes it affordable and the design quality is outstanding. Highly recommend!',
      rating: 5,
      active: true,
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Director',
      company: 'GrowthLab',
      content: 'We switched from a one-time design agency to WebForge and couldn\'t be happier. The ongoing support and regular updates keep our site fresh and modern.',
      rating: 5,
      active: true,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder',
      company: 'Bloom Studio',
      content: 'As a small business owner, I needed a professional website without breaking the bank. WebForge delivered beyond my expectations with their annual plan.',
      rating: 5,
      active: true,
    },
    {
      name: 'David Park',
      role: 'CTO',
      company: 'InnovateTech',
      content: 'The technical quality of the websites is impressive. Fast loading times, perfect SEO scores, and the database integration was seamless. Great value for money.',
      rating: 4,
      active: true,
    },
  ]

  for (const testimonial of testimonials) {
    await db.testimonial.create({ data: testimonial })
  }

  // Create FAQs
  const faqs = [
    {
      question: 'How does the subscription model work?',
      answer: 'Our subscription model provides you with a professionally designed website for a monthly or annual fee. This includes hosting, maintenance, design updates, and technical support. You can cancel anytime with our flexible plans.',
      order: 1,
      active: true,
    },
    {
      question: 'What\'s included in the website design?',
      answer: 'Every subscription includes a custom-designed website based on your chosen template, responsive mobile layouts, SSL certificate, domain setup, SEO optimization, and ongoing maintenance. Annual plans also include priority support and e-commerce integration.',
      order: 2,
      active: true,
    },
    {
      question: 'Can I switch between plans?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll get immediate access to additional features. When downgrading, changes take effect at the start of your next billing cycle.',
      order: 3,
      active: true,
    },
    {
      question: 'How long does it take to build my website?',
      answer: 'Typically, we deliver your initial website within 5-7 business days after receiving your requirements. Complex projects with e-commerce or custom features may take up to 14 business days.',
      order: 4,
      active: true,
    },
    {
      question: 'Do I own the website design?',
      answer: 'While you have full usage rights to your website as long as your subscription is active, the underlying template designs remain our intellectual property. If you cancel, you can export your content at any time.',
      order: 5,
      active: true,
    },
    {
      question: 'What happens if I cancel my subscription?',
      answer: 'If you cancel, your website will remain active until the end of your current billing period. After that, we provide a 30-day grace period to export your data. You can reactivate your subscription at any time.',
      order: 6,
      active: true,
    },
  ]

  for (const faq of faqs) {
    await db.fAQ.create({ data: faq })
  }

  // Create social links
  const socialLinks = [
    { platform: 'facebook', url: 'https://facebook.com/webforge', order: 1, active: true },
    { platform: 'twitter', url: 'https://twitter.com/webforge', order: 2, active: true },
    { platform: 'instagram', url: 'https://instagram.com/webforge', order: 3, active: true },
    { platform: 'linkedin', url: 'https://linkedin.com/company/webforge', order: 4, active: true },
    { platform: 'youtube', url: 'https://youtube.com/@webforge', order: 5, active: true },
  ]

  for (const link of socialLinks) {
    await db.socialLink.create({ data: link })
  }

  // Create payment gateways
  const gateways = [
    {
      name: 'Stripe',
      provider: 'stripe',
      active: true,
      testMode: true,
      apiKey: 'pk_test_xxxxxxxxxxxxx',
      secretKey: 'sk_test_xxxxxxxxxxxxx',
    },
    {
      name: 'PayPal',
      provider: 'paypal',
      active: false,
      testMode: true,
      apiKey: 'sb_xxxxxxxxxxxxx',
    },
    {
      name: 'Bank Transfer',
      provider: 'bank',
      active: true,
      testMode: false,
      config: JSON.stringify({
        bankName: 'First National Bank',
        accountName: 'WebForge LLC',
        accountNumber: '****4567',
        routingNumber: '****8901',
      }),
    },
  ]

  for (const gateway of gateways) {
    await db.paymentGateway.create({ data: gateway })
  }

  // Create a demo subscription and order for the demo user
  const startDate = new Date()
  const endDate = new Date()
  endDate.setFullYear(endDate.getFullYear() + 1)

  const subscription = await db.subscription.create({
    data: {
      userId: demo.id,
      planId: annualPlan.id,
      status: 'active',
      startDate,
      endDate,
      lastPayment: new Date(),
      templateId: null,
    },
  })

  await db.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: 300,
      currency: 'USD',
      status: 'completed',
      method: 'card',
      transactionId: 'TXN-' + Date.now(),
    },
  })

  await db.order.create({
    data: {
      userId: demo.id,
      planId: annualPlan.id,
      status: 'in_progress',
      progress: 45,
      milestones: JSON.stringify([
        { name: 'Briefing', status: 'completed', date: '2025-01-15' },
        { name: 'Design', status: 'in_progress', date: '2025-01-20' },
        { name: 'Development', status: 'pending', date: null },
        { name: 'Launch', status: 'pending', date: null },
      ]),
      notes: 'Client prefers a modern, minimalist design with blue accents.',
    },
  })

  // Create a support ticket for demo user
  const ticket = await db.supportTicket.create({
    data: {
      userId: demo.id,
      subject: 'Need help with domain setup',
      category: 'technical',
      status: 'open',
      priority: 'medium',
    },
  })

  await db.message.create({
    data: {
      ticketId: ticket.id,
      senderId: demo.id,
      content: 'Hi, I need help setting up my custom domain. I\'ve already purchased the domain but I\'m not sure how to point it to my website.',
      isRead: true,
    },
  })

  await db.message.create({
    data: {
      ticketId: ticket.id,
      senderId: admin.id,
      content: 'Hello! I\'d be happy to help you with your domain setup. Please follow these steps:\n\n1. Log into your domain registrar\n2. Go to DNS settings\n3. Add a CNAME record pointing to our servers\n4. We\'ll handle the rest!\n\nI\'ll send you the specific DNS values shortly.',
      isRead: false,
    },
  })

  console.log('Database seeded successfully!')
}
