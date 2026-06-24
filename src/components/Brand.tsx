'use client'

interface BrandProps {
  siteName: string
  className?: string
}

/**
 * Shared brand name renderer — highlights the "Forge" suffix in cyan.
 * Used by both Header and Footer to avoid code duplication.
 */
export default function Brand({ siteName, className = '' }: BrandProps) {
  if (siteName.toLowerCase().endsWith('forge')) {
    const prefix = siteName.slice(0, -5)
    const suffix = siteName.slice(-5)
    return <span className={className}>{prefix}<span className="text-[#00D1FF]">{suffix}</span></span>
  }
  return <span className={className}>{siteName}</span>
}
