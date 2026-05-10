'use client'

import { motion } from 'framer-motion'
import { ChevronDown, MousePointer, Hand, MapPin } from 'lucide-react'
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

      {/* Interaction hints - right side panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-1/4 right-6 hidden lg:flex flex-col gap-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-800 italic">Interactions:</h2>
        <div className="flex flex-col gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Hand className="w-3 h-3" />
            <span>Drag background to rotate camera</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointer className="w-3 h-3" />
            <span>Click on cubes to select projects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded">Scroll</span>
            <span>Zoom in/out</span>
          </div>
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
