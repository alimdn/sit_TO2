'use client'

import dynamic from 'next/dynamic'

// Dynamically import the LikeButton to avoid SSR issues
const LikeButton = dynamic(() => import('@fmarlats/react-like-button'), {
  ssr: false,
  loading: () => <div className="w-12 h-12" />,
})

import '@fmarlats/react-like-button/like-button.css'

interface LikeButtonWidgetProps {
  count?: number
  size?: number
}

export default function LikeButtonWidget({ count = 0, size = 48 }: LikeButtonWidgetProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#c1c8c1] shadow-card">
      <LikeButton
        size={size}
        shape="rounded"
        onClick={(clicks: number) => {
          console.log('Like clicks:', clicks)
        }}
      />
      <div>
        <p className="text-sm font-semibold text-[#29503c]">Like / Favorite</p>
        <p className="text-xs text-[#414843]">Animated like button with particle effects</p>
      </div>
    </div>
  )
}
