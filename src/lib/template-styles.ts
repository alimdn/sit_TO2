/**
 * Template Style Mapping
 *
 * Maps each template to its design style name and color palette.
 * This is used by TemplateCard to display style info under each template,
 * so customers can choose templates by style/colors (not just by industry).
 *
 * The mapping is keyed by the template's file name (livePreview / previewUrl),
 * falling back to title-based keyword matching for templates not explicitly listed.
 *
 * Colors are the 3-5 most representative hex values from each template's
 * actual CSS — extracted from the HTML files.
 */

export interface TemplateStyle {
  /** Display name of the design style, e.g. "Cyberpunk Neon" */
  styleName: string
  /** 3-6 representative hex colors from the template's palette */
  styleColors: string[]
}

/**
 * Explicit mapping by template file name.
 * Templates not listed here will use keyword-based detection below.
 */
const STYLE_BY_FILE: Record<string, TemplateStyle> = {
  // Stitch style templates
  'stitch-cyberpunk.html': {
    styleName: 'Cyberpunk Arabic',
    styleColors: ['#0f0f1a', '#e94560', '#d0bcff', '#10b981'],
  },
  'stitch-glassmorphism.html': {
    styleName: 'Glassmorphism',
    styleColors: ['#0f0f1a', '#1a1a2e', '#ff6b81', '#d0bcff'],
  },
  'stitch-bento-grid.html': {
    styleName: 'Bento Grid',
    styleColors: ['#0f0f1a', '#1a1a2e', '#ff6b81', '#10b981'],
  },
  'stitch-minimalism.html': {
    styleName: 'Minimalism',
    styleColors: ['#0f0f1a', '#1a1a2e', '#c6c4df', '#e3e0f1'],
  },
  'stitch-cyber-araby-narrative.html': {
    styleName: 'Cyber-Araby Narrative',
    styleColors: ['#0f0f1a', '#e94560', '#d0bcff', '#10b981'],
  },
  'stitch-heritage-organic.html': {
    styleName: 'Heritage Organic',
    styleColors: ['#fff8f0', '#844432', '#948951', '#1A1A1A'],
  },
  'stitch-lumina-wellness-system.html': {
    styleName: 'Lumina Wellness',
    styleColors: ['#F9F7F2', '#121414', '#8C943E', '#C5A368'],
  },
  'stitch-lumina-wellness-home.html': {
    styleName: 'Lumina Wellness',
    styleColors: ['#F9F7F2', '#121414', '#8C943E', '#C5A368'],
  },
  'stitch-lumina-metabolic-restoration.html': {
    styleName: 'Lumina Wellness',
    styleColors: ['#F9F7F2', '#121414', '#8C943E', '#C5A368'],
  },
  'stitch-lumina-about.html': {
    styleName: 'Lumina Wellness',
    styleColors: ['#F9F7F2', '#121414', '#8C943E', '#C5A368'],
  },
  'stitch-integrated-platform.html': {
    styleName: 'Integrated Platform',
    styleColors: ['#0f0f1a', '#1a1a2e', '#ff6b81', '#d0bcff'],
  },
  'stitch-modern-web-styles.html': {
    styleName: 'Modern Web Styles',
    styleColors: ['#0f0f1a', '#e94560', '#d0bcff', '#10b981'],
  },
  'stitch-home-services-marketplace.html': {
    styleName: 'Hospitality Excellence',
    styleColors: ['#fcf8f9', '#001ac0', '#535e79', '#283fff'],
  },
  'stitch-bilad-al-aseer-homepage.html': {
    styleName: 'Bilad Al-Aseer',
    styleColors: ['#fcf8f9', '#001ac0', '#535e79', '#283fff'],
  },
  'stitch-bilad-al-aseer-culture.html': {
    styleName: 'Bilad Al-Aseer Culture',
    styleColors: ['#fcf8f9', '#001ac0', '#535e79', '#283fff'],
  },

  // Style showcase templates
  'style-cyberpunk-neon.html': {
    styleName: 'Cyberpunk Neon',
    styleColors: ['#0a0a0a', '#00fff0', '#39ff14', '#ff2d92'],
  },
  'style-glassmorphism.html': {
    styleName: 'Glassmorphism',
    styleColors: ['#0f0a1e', '#06b6d4', '#1e1b4b', '#0891b2'],
  },
  'style-bento-grid.html': {
    styleName: 'Bento Grid',
    styleColors: ['#18181b', '#3f3f46', '#e4e4e7', '#f4f4f5'],
  },
  'style-minimalism.html': {
    styleName: 'Minimalism',
    styleColors: ['#ffffff', '#1a1a1a', '#3b82f6', '#f5f5f5'],
  },
  'style-dark-mode.html': {
    styleName: 'Dark Mode',
    styleColors: ['#0a0a0a', '#00d4ff', '#f0f0f0', '#1a1a1a'],
  },
  'style-neomorphism.html': {
    styleName: 'Neomorphism',
    styleColors: ['#e0e5ec', '#a3b1c6', '#4a5568', '#ffffff'],
  },
  'style-brutalism.html': {
    styleName: 'Brutalism',
    styleColors: ['#FFE600', '#000000', '#ffffff', '#ff2d92'],
  },
  'style-3d-immersive.html': {
    styleName: '3D Immersive',
    styleColors: ['#0a0a0a', '#8b5cf6', '#06b6d4', '#f0f0f0'],
  },
  'style-claymorphism-dark.html': {
    styleName: 'Claymorphism Dark',
    styleColors: ['#1a1a2e', '#ff6b6b', '#4ecdc4', '#ffe66d'],
  },
  'style-gradient-design.html': {
    styleName: 'Gradient Design',
    styleColors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
  },
  'style-typography-first.html': {
    styleName: 'Typography First',
    styleColors: ['#ffffff', '#000000', '#ff6b6b', '#f5f5f5'],
  },
  'style-parallax.html': {
    styleName: 'Parallax',
    styleColors: ['#0a0a0a', '#ff6b6b', '#4ecdc4', '#f0f0f0'],
  },
  'style-micro-interactions.html': {
    styleName: 'Micro Interactions',
    styleColors: ['#0a0a0a', '#00d4ff', '#10b981', '#f0f0f0'],
  },
  'style-retro-y2k.html': {
    styleName: 'Retro Y2K',
    styleColors: ['#FFE600', '#ff2d92', '#00fff0', '#000000'],
  },

  // Dark variants
  'style-bauhaus-dark.html': {
    styleName: 'Bauhaus Dark',
    styleColors: ['#1a1a1a', '#e63946', '#f1faee', '#457b9d'],
  },
  'style-card-based-dark.html': {
    styleName: 'Card-Based Dark',
    styleColors: ['#0a0a0a', '#1a1a2e', '#00d4ff', '#f0f0f0'],
  },
  'style-flat-design-dark.html': {
    styleName: 'Flat Design Dark',
    styleColors: ['#0a0a0a', '#3b82f6', '#10b981', '#f0f0f0'],
  },
  'style-grain-dark.html': {
    styleName: 'Grain Dark',
    styleColors: ['#0a0a0a', '#f5e6d3', '#d4a574', '#f0f0f0'],
  },
  'style-magazine-dark.html': {
    styleName: 'Magazine Dark',
    styleColors: ['#0a0a0a', '#e63946', '#f1faee', '#a8dadc'],
  },
  'style-monochrome-dark.html': {
    styleName: 'Monochrome Dark',
    styleColors: ['#0a0a0a', '#ffffff', '#404040', '#a0a0a0'],
  },
  'style-organic-dark.html': {
    styleName: 'Organic Dark',
    styleColors: ['#0a0a0a', '#2d5016', '#a3b18a', '#f0f0f0'],
  },
  'style-scroll-animations-dark.html': {
    styleName: 'Scroll Animations Dark',
    styleColors: ['#0a0a0a', '#8b5cf6', '#06b6d4', '#f0f0f0'],
  },
  'style-split-screen-dark.html': {
    styleName: 'Split Screen Dark',
    styleColors: ['#0a0a0a', '#ff6b6b', '#4ecdc4', '#f0f0f0'],
  },
  'style-swiss-dark.html': {
    styleName: 'Swiss Dark',
    styleColors: ['#0a0a0a', '#ff6b6b', '#ffffff', '#f5f5f5'],
  },
  'style-vaporwave-dark.html': {
    styleName: 'Vaporwave Dark',
    styleColors: ['#0a0a0a', '#ff71ce', '#01cdfe', '#05ffa1'],
  },

  // Business/site templates
  'site-restaurant.html': {
    styleName: 'Restaurant Elegant',
    styleColors: ['#1c1917', '#292524', '#7f1d1d', '#f5f5f4'],
  },
  'site-dental.html': {
    styleName: 'Medical Clean',
    styleColors: ['#0f172a', '#06b6d4', '#0d9488', '#14b8a6'],
  },
  'site-portfolio.html': {
    styleName: 'Portfolio Creative',
    styleColors: ['#1e1b4b', '#7c3aed', '#8b5cf6', '#a78bfa'],
  },
  'site-barber.html': {
    styleName: 'Barber Classic',
    styleColors: ['#0a0a0a', '#D4AF37', '#ffffff', '#1a1a1a'],
  },
  'site-gym.html': {
    styleName: 'Gym Energy',
    styleColors: ['#0a0a0a', '#ff6b00', '#ffffff', '#1a1a1a'],
  },
  'site-medical.html': {
    styleName: 'Medical Trust',
    styleColors: ['#ffffff', '#0066cc', '#00a8e8', '#f0f8ff'],
  },
  'site-realestate.html': {
    styleName: 'Real Estate Pro',
    styleColors: ['#0a0a0a', '#c9a96e', '#ffffff', '#1a1a1a'],
  },
  'site-auto-repair.html': {
    styleName: 'Auto Industrial',
    styleColors: ['#0a0a0a', '#ff6b00', '#ffffff', '#1a1a1a'],
  },
  'site-montanas-bar.html': {
    styleName: 'Bar Warm',
    styleColors: ['#1c1917', '#92400e', '#fbbf24', '#f5f5f4'],
  },

  // EduMentor templates
  'edumentor-course-platform.html': {
    styleName: 'EduMentor Modern',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'site-edumentor-course-view.html': {
    styleName: 'EduMentor Course',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'stitch-course-detail.html': {
    styleName: 'Course Detail',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'stitch-interactive-quiz.html': {
    styleName: 'Interactive Quiz',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'stitch-video-player.html': {
    styleName: 'Video Player',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'site-stitch-learning.html': {
    styleName: 'Learning Platform',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  'nexus-multi-purpose.html': {
    styleName: 'Nexus Multi-Purpose',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
}

/**
 * Default style for templates not in the explicit mapping.
 * Uses a neutral palette based on the template's category.
 */
const DEFAULT_STYLES: Record<string, TemplateStyle> = {
  Business: {
    styleName: 'Business Modern',
    styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
  },
  Education: {
    styleName: 'Education Clean',
    styleColors: ['#0f172a', '#3b82f6', '#06b6d4', '#ffffff'],
  },
  Portfolio: {
    styleName: 'Portfolio Creative',
    styleColors: ['#1e1b4b', '#7c3aed', '#8b5cf6', '#a78bfa'],
  },
  Style: {
    styleName: 'Custom Style',
    styleColors: ['#0f0f1a', '#00D1FF', '#10B981', '#ffffff'],
  },
  'E-commerce': {
    styleName: 'E-Commerce',
    styleColors: ['#0a0a0a', '#10B981', '#f59e0b', '#ffffff'],
  },
  Blog: {
    styleName: 'Blog Editorial',
    styleColors: ['#ffffff', '#1a1a1a', '#3b82f6', '#f5f5f5'],
  },
  SaaS: {
    styleName: 'SaaS Modern',
    styleColors: ['#0a0a0a', '#8b5cf6', '#06b6d4', '#ffffff'],
  },
}

const FALLBACK_STYLE: TemplateStyle = {
  styleName: 'Custom Design',
  styleColors: ['#000f22', '#00D1FF', '#10B981', '#ffffff'],
}

/**
 * Get the style info for a template.
 * Tries explicit file mapping first, then category-based default.
 */
export function getStyleForTemplate(template: {
  title: string
  category: string
  livePreview?: string | null
  previewUrl?: string | null
}): TemplateStyle {
  // 1. Try explicit file mapping
  const file = template.livePreview || template.previewUrl || ''
  if (file && STYLE_BY_FILE[file]) {
    return STYLE_BY_FILE[file]
  }

  // 2. Try keyword-based detection from title
  const titleLower = template.title.toLowerCase()
  if (titleLower.includes('cyber') || titleLower.includes('neon')) {
    return STYLE_BY_FILE['style-cyberpunk-neon.html']
  }
  if (titleLower.includes('glass')) {
    return STYLE_BY_FILE['style-glassmorphism.html']
  }
  if (titleLower.includes('bento')) {
    return STYLE_BY_FILE['style-bento-grid.html']
  }
  if (titleLower.includes('minimal')) {
    return STYLE_BY_FILE['style-minimalism.html']
  }
  if (titleLower.includes('dark')) {
    return STYLE_BY_FILE['style-dark-mode.html']
  }
  if (titleLower.includes('brutal')) {
    return STYLE_BY_FILE['style-brutalism.html']
  }
  if (titleLower.includes('lumina') || titleLower.includes('wellness')) {
    return STYLE_BY_FILE['stitch-lumina-wellness-system.html']
  }
  if (titleLower.includes('heritage') || titleLower.includes('organic')) {
    return STYLE_BY_FILE['stitch-heritage-organic.html']
  }

  // 3. Fall back to category-based default
  return DEFAULT_STYLES[template.category] || FALLBACK_STYLE
}
