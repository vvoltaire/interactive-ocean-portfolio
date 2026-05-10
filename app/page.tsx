'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { HeroOverlay } from '@/components/hero-overlay'
import { ProjectModal } from '@/components/project-modal'
import { PortfolioSection } from '@/components/portfolio-section'
import { LoadingScreen } from '@/components/loading-screen'
import type { Project } from '@/lib/projects'

// Dynamic import for the 3D scene to avoid SSR issues
const OceanScene = dynamic(
  () => import('@/components/ocean/ocean-scene').then((mod) => mod.OceanScene),
  { 
    ssr: false,
    loading: () => null,
  }
)

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const portfolioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const handleScrollToPortfolio = useCallback(() => {
    setShowPortfolio(true)
    setTimeout(() => {
      portfolioRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  const handleBackToOcean = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setShowPortfolio(false), 500)
  }, [])

  const handleSelectProject = useCallback((project: Project | null) => {
    setSelectedProject(project)
  }, [])

  return (
    <main className="relative">
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && <LoadingScreen progress={loadingProgress} />}
      </AnimatePresence>

      {/* 3D Ocean Hero Section */}
      <section className="relative h-screen">
        <OceanScene 
          onSelectProject={handleSelectProject} 
          selectedProject={selectedProject}
        />
        <HeroOverlay onScrollToPortfolio={handleScrollToPortfolio} />
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      </section>

      {/* Traditional Portfolio Section */}
      {showPortfolio && (
        <div ref={portfolioRef}>
          <PortfolioSection onBackToOcean={handleBackToOcean} />
        </div>
      )}
    </main>
  )
}
