'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Headphones, Globe, Gamepad2, BarChart3, Smartphone, Bot } from 'lucide-react'
import type { Project } from '@/lib/projects'
import { Button } from '@/components/ui/button'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

const iconMap = {
  audio: Headphones,
  web: Globe,
  game: Gamepad2,
  data: BarChart3,
  mobile: Smartphone,
  ai: Bot,
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null
  
  const Icon = iconMap[project.icon]

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div 
              className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
              style={{
                boxShadow: `0 0 60px ${project.color}20, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }}
              />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: project.color }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {project.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {project.description}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  {project.link && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      asChild
                    >
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                        View Code
                      </a>
                    </Button>
                  )}
                  {project.demoLink && (
                    <Button
                      className="gap-2"
                      style={{ 
                        backgroundColor: project.color,
                        color: '#fff',
                      }}
                      asChild
                    >
                      <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
