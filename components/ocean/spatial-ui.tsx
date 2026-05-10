'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Hand, MousePointer, Move3D, ZoomIn } from 'lucide-react'

interface SpatialUIPanelProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function SpatialInteractionsPanel({ 
  position = [8, 2.5, -2],
  rotation = [0, -0.3, 0],
  scale = 1 
}: SpatialUIPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const initialY = useRef(position[1])
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      // Subtle bob
      groupRef.current.position.y = initialY.current + Math.sin(time * 0.5) * 0.08
      // Very slight rotation sway
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.3) * 0.02
    }
  })

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <Html
        transform
        occlude
        distanceFactor={8}
        style={{
          transition: 'all 0.3s',
          opacity: 1,
        }}
      >
        <div 
          className="pointer-events-auto select-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.12),
              0 2px 8px rgba(0,0,0,0.08),
              inset 0 1px 0 rgba(255,255,255,0.4),
              inset 0 -1px 0 rgba(0,0,0,0.05)
            `,
            padding: '20px 24px',
            minWidth: '220px',
          }}
        >
          {/* Header with subtle gradient */}
          <div 
            className="flex items-center gap-2 mb-4 pb-3"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Move3D 
              className="w-4 h-4" 
              style={{ color: 'rgba(30, 64, 100, 0.9)' }}
            />
            <span 
              className="text-sm font-semibold tracking-wide"
              style={{ 
                color: 'rgba(20, 50, 80, 0.95)',
                textShadow: '0 1px 2px rgba(255,255,255,0.5)',
              }}
            >
              Interactions
            </span>
          </div>
          
          {/* Interaction hints */}
          <div className="flex flex-col gap-3">
            <InteractionHint 
              icon={<Hand className="w-3.5 h-3.5" />}
              text="Drag to rotate camera"
            />
            <InteractionHint 
              icon={<MousePointer className="w-3.5 h-3.5" />}
              text="Click cubes to select"
            />
            <InteractionHint 
              icon={<ZoomIn className="w-3.5 h-3.5" />}
              text="Scroll to zoom"
            />
          </div>
        </div>
      </Html>
    </group>
  )
}

function InteractionHint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div 
      className="flex items-center gap-3"
      style={{
        color: 'rgba(30, 60, 90, 0.85)',
      }}
    >
      <div 
        className="flex items-center justify-center w-7 h-7 rounded-lg"
        style={{
          background: 'rgba(255,255,255,0.4)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        {icon}
      </div>
      <span 
        className="text-xs font-medium"
        style={{
          textShadow: '0 1px 1px rgba(255,255,255,0.4)',
        }}
      >
        {text}
      </span>
    </div>
  )
}

// Optional: A floating title card that could appear in the scene
export function SpatialTitleCard({
  position = [-6, 3, -4],
  rotation = [0, 0.25, 0],
}: SpatialUIPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const initialY = useRef(position[1])
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      groupRef.current.position.y = initialY.current + Math.sin(time * 0.4 + 1) * 0.1
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.25) * 0.015
    }
  })

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={rotation}
    >
      <Html
        transform
        occlude
        distanceFactor={10}
      >
        <div 
          className="pointer-events-none select-none text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            padding: '16px 28px',
          }}
        >
          <div 
            className="text-lg font-bold tracking-tight mb-1"
            style={{ 
              color: 'rgba(20, 50, 80, 0.95)',
              textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            }}
          >
            Creative Portfolio
          </div>
          <div 
            className="text-xs font-medium tracking-wide"
            style={{ 
              color: 'rgba(40, 70, 100, 0.75)',
            }}
          >
            Explore the floating cubes
          </div>
        </div>
      </Html>
    </group>
  )
}
