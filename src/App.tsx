import { useState } from 'react'
import OceanCanvas from './components/Canvas/OceanCanvas'

export default function App() {
  const [_activeProject, _setActiveProject] = useState<string | null>(null)

  return (
    <div className="w-screen h-screen bg-ocean-950">
      {/* Hero Section with 3D Canvas */}
      <div id="hero" className="relative w-full h-screen">
        <OceanCanvas />
        
        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center z-10">
            <h1 className="text-6xl font-bold text-white mb-4 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Your Name
            </h1>
            <p className="text-xl text-ocean-300 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Full-Stack Developer & Creative Technologist
            </p>
            <div className="mt-12 opacity-0 animate-fadeIn" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <div className="flex justify-center animate-float">
                <svg className="w-6 h-6 text-ocean-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <p className="text-sm text-ocean-400 mt-2">Scroll to explore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div id="portfolio" className="w-full bg-ocean-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12">Projects</h2>
          <p className="text-ocean-300">Portfolio content coming soon...</p>
        </div>
      </div>
    </div>
  )
}
