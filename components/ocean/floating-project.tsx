'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/projects'
import { getWaveData, getNormalRotation } from '@/lib/wave-utils'
import { getProjectModel } from './project-models'
import { Headphones, Globe, Gamepad2, BarChart3, Smartphone, Bot } from 'lucide-react'

interface FloatingProjectProps {
  project: Project
  onSelect: (project: Project) => void
  isSelected: boolean
}

const iconMap = {
  audio: Headphones,
  web: Globe,
  game: Gamepad2,
  data: BarChart3,
  mobile: Smartphone,
  ai: Bot,
}

export function FloatingProject({ project, onSelect, isSelected }: FloatingProjectProps) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const Icon = iconMap[project.icon]
  const initialRotationY = useRef(Math.random() * Math.PI * 2)
  
  // Get the appropriate 3D model for this project
  const ProjectModel = useMemo(() => getProjectModel(project.id), [project.id])
  
  // FFT-style buoyancy parameters - heavy, stable objects
  // 40% submerged - negative offset to sink them deeper
  const submersionDepth = -0.15 // How deep below waterline (40% submerged)
  const buoyancyOffset = 0.4 // Base height offset
  
  // High damping for heavy, stable feel
  const linearDamping = 0.03 // Very slow height changes
  const angularDamping = 0.04 // Very slow rotation changes
  
  // Store previous values for smooth lerp interpolation
  const prevRotation = useRef({ x: 0, z: 0 })
  const prevHeight = useRef(submersionDepth + buoyancyOffset)
  const prevVelocityY = useRef(0)
  const prevAngularVelX = useRef(0)
  const prevAngularVelZ = useRef(0)

  useFrame((state) => {
    if (!groupRef.current || !modelRef.current) return
    
    const time = state.clock.elapsedTime
    const x = project.position[0]
    const z = project.position[2]
    
    // Get wave data at object position
    const waveData = getWaveData(x, z, time, 0.6)
    
    // Target height - object floats on wave with submersion
    const targetHeight = waveData.height + buoyancyOffset + submersionDepth
    
    // FFT-style spring physics for height (heavy damping)
    const heightDiff = targetHeight - prevHeight.current
    prevVelocityY.current += heightDiff * 0.1 // Spring force
    prevVelocityY.current *= (1 - linearDamping) // Damping
    prevHeight.current += prevVelocityY.current
    
    // Clamp to prevent extreme oscillations
    prevHeight.current = THREE.MathUtils.lerp(
      prevHeight.current, 
      targetHeight, 
      linearDamping * 2
    )
    
    groupRef.current.position.y = prevHeight.current
    
    // Get rotation from wave normal (mostly upright)
    const [targetRotX, targetRotZ] = getNormalRotation(waveData.normal)
    
    // Scale down rotation for heavy objects (stay more upright)
    const scaledTargetRotX = targetRotX * 0.4
    const scaledTargetRotZ = targetRotZ * 0.4
    
    // Angular spring physics with high damping
    const rotXDiff = scaledTargetRotX - prevRotation.current.x
    const rotZDiff = scaledTargetRotZ - prevRotation.current.z
    
    prevAngularVelX.current += rotXDiff * 0.08
    prevAngularVelZ.current += rotZDiff * 0.08
    prevAngularVelX.current *= (1 - angularDamping)
    prevAngularVelZ.current *= (1 - angularDamping)
    
    prevRotation.current.x += prevAngularVelX.current
    prevRotation.current.z += prevAngularVelZ.current
    
    // Apply rotation to model
    modelRef.current.rotation.x = prevRotation.current.x
    modelRef.current.rotation.z = prevRotation.current.z
    modelRef.current.rotation.y = initialRotationY.current + time * 0.05 // Very slow spin
  })

  return (
    <group
      ref={groupRef}
      position={project.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect(project)}
    >
      {/* 3D Model */}
      <group 
        ref={modelRef}
        position={[0, 0.1, 0]} 
        scale={hovered || isSelected ? 1.1 : 1}
      >
        <ProjectModel 
          color={project.color} 
          hovered={hovered} 
          isSelected={isSelected} 
        />
      </group>

      {/* Water surface reflection glow */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        position={[0, 0.3, 0]}
        color={project.color}
        intensity={hovered || isSelected ? 1.5 : 0.6}
        distance={2.5}
      />

      {/* HTML Label Card - positioned higher for readability */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div
              className={`
                px-3 py-2 rounded-lg backdrop-blur-md border transition-all duration-300
                ${hovered || isSelected 
                  ? 'bg-white/95 border-primary/50 shadow-xl scale-105' 
                  : 'bg-white/80 border-white/40'
                }
              `}
              style={{ minWidth: '130px' }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: project.color + '30' }}
                >
                  <Icon className="w-2.5 h-2.5" style={{ color: project.color }} />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                  {project.title}
                </h3>
              </div>
              
              <AnimatePresence>
                {(hovered || isSelected) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 pointer-events-auto cursor-pointer hover:text-primary transition-colors font-medium">
                      Click to view details
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </Html>
    </group>
  )
}
