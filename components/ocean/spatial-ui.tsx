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
  position = [12, 1.2, 8],  // Bottom-right area
  rotation = [0, -0.5, 0],
  scale = 0.7  // Smaller scale
}: SpatialUIPanelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const initialY = useRef(position[1])
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      // Subtle bob
      groupRef.current.position.y = initialY.current + Math.sin(time * 0.5) * 0.04
      // Very slight rotation sway
      groupRef.current.rotation.y = rotation[1] + Math.sin(time * 0.3) * 0.01
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
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: `
              0 4px 20px rgba(0,0,0,0.08),
              0 1px 4px rgba(0,0,0,0.05),
              inset 0 1px 0 rgba(255,255,255,0.25)
            `,
            padding: '14px 18px',
            minWidth: '160px',
          }}
        >
          {/* Header with subtle gradient */}
          <div 
            className="flex items-center gap-1.5 mb-2.5 pb-2"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Move3D 
              className="w-3 h-3" 
              style={{ color: 'rgba(30, 64, 100, 0.8)' }}
            />
            <span 
              className="text-xs font-semibold tracking-wide"
              style={{ 
                color: 'rgba(20, 50, 80, 0.9)',
                textShadow: '0 1px 2px rgba(255,255,255,0.4)',
              }}
            >
              Controls
            </span>
          </div>
          
          {/* Interaction hints */}
          <div className="flex flex-col gap-2">
            <InteractionHint 
              icon={<Hand className="w-2.5 h-2.5" />}
              text="Drag to rotate"
            />
            <InteractionHint 
              icon={<MousePointer className="w-2.5 h-2.5" />}
              text="Click to select"
            />
            <InteractionHint 
              icon={<ZoomIn className="w-2.5 h-2.5" />}
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
      className="flex items-center gap-2"
      style={{
        color: 'rgba(30, 60, 90, 0.8)',
      }}
    >
      <div 
        className="flex items-center justify-center w-5 h-5 rounded"
        style={{
          background: 'rgba(255,255,255,0.3)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
        }}
      >
        {icon}
      </div>
      <span 
        className="text-[10px] font-medium"
        style={{
          textShadow: '0 1px 1px rgba(255,255,255,0.3)',
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
