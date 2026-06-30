'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteButtonProps {
  templateId: string
}

/**
 * Reusable favorite/wishlist button.
 * - Reads/writes localStorage 'templateFavorites' array
 * - Shows red heart when favorited, gray when not
 * - Toast notification on toggle
 * - Works in both TemplateCard and TemplatePreview
 */
export default function FavoriteButton({ templateId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  // Load favorite state on mount
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('templateFavorites') || '[]')
      setIsFavorited(favorites.includes(templateId))
    } catch {
      setIsFavorited(false)
    }
  }, [templateId])

  // Listen for storage changes (sync between TemplateCard and TemplatePreview)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('templateFavorites') || '[]')
        setIsFavorited(favorites.includes(templateId))
      } catch {
        setIsFavorited(false)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom event (same-tab updates)
    window.addEventListener('favoritesUpdated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('favoritesUpdated', handleStorageChange)
    }
  }, [templateId])

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    try {
      const favorites = JSON.parse(localStorage.getItem('templateFavorites') || '[]')
      if (favorites.includes(templateId)) {
        localStorage.setItem('templateFavorites', JSON.stringify(favorites.filter((id: string) => id !== templateId)))
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        localStorage.setItem('templateFavorites', JSON.stringify([...favorites, templateId]))
        setIsFavorited(true)
        toast.success('Added to favorites! You can return to it later.')
      }
      // Dispatch custom event so other FavoriteButton instances update
      window.dispatchEvent(new Event('favoritesUpdated'))
    } catch {
      // localStorage might not be available
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-200 flex-shrink-0 mt-1 ${
        isFavorited
          ? 'border-[#ef4444] bg-[#ef4444]/5 text-[#ef4444]'
          : 'border-[#c1c8c1] hover:border-[#ef4444] text-[#43474d] hover:text-[#ef4444]'
      }`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-[#ef4444]' : ''}`} />
      <span className="text-xs font-semibold hidden sm:inline">
        {isFavorited ? 'Favorited' : 'Favorite'}
      </span>
    </button>
  )
}
