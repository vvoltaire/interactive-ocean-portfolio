'use client'

import { motion } from 'framer-motion'
import { ChevronDown, MapPin } from 'lucide-react'
import { profile } from '@/lib/projects'

interface HeroOverlayProps {
  onScrollToPortfolio: () => void
}

export function HeroOverlay({ onScrollToPortfolio }: HeroOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Title - positioned at top */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute top-8 left-0 right-0 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">
          <span className="text-white drop-shadow-lg">
            {profile.name}
          </span>
        </h1>
        <p className="text-base md:text-lg text-white/90 font-light tracking-wide drop-shadow mb-2">
          {profile.title}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-sm text-white/80">
          <MapPin className="w-3.5 h-3.5" />
          <span>{profile.location}</span>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        onClick={onScrollToPortfolio}
        className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/90 hover:text-white transition-colors group cursor-pointer"
      >
        <span className="text-xs font-medium tracking-wide uppercase drop-shadow">View Portfolio</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 group-hover:text-sky-300 transition-colors" />
        </motion.div>
      </motion.button>
    </div>
  )
}
