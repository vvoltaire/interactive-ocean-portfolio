'use client'

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  progress: number
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200"
    >
      {/* Animated water ripples */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-400/30"
            initial={{ width: 100, height: 100, opacity: 0.8 }}
            animate={{
              width: [100, 400],
              height: [100, 400],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Water drop icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 mb-6 relative"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-sky-500">
            <motion.path
              fill="currentColor"
              d="M12 21.5C16.1421 21.5 19.5 18.1421 19.5 14C19.5 11.4691 17.6303 8.01836 14.4581 4.18779C13.2029 2.64208 10.7971 2.64208 9.54186 4.18779C6.36971 8.01836 4.5 11.4691 4.5 14C4.5 18.1421 7.85786 21.5 12 21.5Z"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-slate-800 mb-6"
        >
          Initializing Water Simulation
        </motion.h1>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-sm text-slate-600"
        >
          {progress < 30 
            ? 'Loading shaders...' 
            : progress < 60 
              ? 'Creating water surface...' 
              : progress < 90 
                ? 'Adding caustics...' 
                : 'Ready'}
        </motion.p>
      </div>
    </motion.div>
  )
}
