'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/projects'
import { getWaveData, getNormalRotation } from '@/lib/wave-utils'
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
  const meshRef = useRef<THREE.Mesh>(null)
  const edgesRef = useRef<THREE.LineSegments>(null)
  const [hovered, setHovered] = useState(false)
  const Icon = iconMap[project.icon]
  const initialRotationY = useRef(Math.random() * Math.PI * 2)
  
  // Buoyancy parameters - increased offset so cubes sit ON the water, not in it
  const buoyancyOffset = 0.75 // How high the cube floats above water surface
  const dampingFactor = 0.08 // Lower = smoother interpolation
  const heightDampingFactor = 0.12 // Separate damping for vertical movement
  
  // Store previous values for smooth interpolation (lerp)
  const prevRotation = useRef({ x: 0, z: 0 })
  const prevHeight = useRef(buoyancyOffset)

  // Create edge geometry for cube outline
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(0.72, 0.72, 0.72)
    return new THREE.EdgesGeometry(box)
  }, [])

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return
    
    const time = state.clock.elapsedTime
    const x = project.position[0]
    const z = project.position[2]
    
    // Get wave data at cube position using shared wave utilities (calmer choppiness)
    const waveData = getWaveData(x, z, time, 0.6)
    
    // Target height - cube floats on wave surface with offset
    const targetHeight = waveData.height + buoyancyOffset
    
    // Smooth height interpolation (lerp) - prevents jitter and getting buried
    prevHeight.current += (targetHeight - prevHeight.current) * heightDampingFactor
    groupRef.current.position.y = prevHeight.current
    
    // Get rotation from wave normal
    const [targetRotX, targetRotZ] = getNormalRotation(waveData.normal)
    
    // Smooth rotation interpolation (lerp) - lower damping = smoother
    prevRotation.current.x += (targetRotX - prevRotation.current.x) * dampingFactor
    prevRotation.current.z += (targetRotZ - prevRotation.current.z) * dampingFactor
    
    // Apply rotation to mesh
    meshRef.current.rotation.x = prevRotation.current.x
    meshRef.current.rotation.z = prevRotation.current.z
    meshRef.current.rotation.y = initialRotationY.current + time * 0.08 // Slow spin
    
    // Sync edge rotation with mesh
    if (edgesRef.current) {
      edgesRef.current.rotation.copy(meshRef.current.rotation)
    }
  })

  return (
    <group
      ref={groupRef}
      position={project.position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect(project)}
    >
      {/* Main floating cube */}
      <mesh 
        ref={meshRef}
        position={[0, 0.4, 0]} 
        scale={hovered || isSelected ? 1.15 : 1}
        castShadow
      >
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshPhysicalMaterial
          color={project.color}
          roughness={0.15}
          metalness={0.1}
          transmission={0.3}
          thickness={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={project.color}
          emissiveIntensity={hovered || isSelected ? 0.4 : 0.15}
        />
      </mesh>

      {/* Cube edge highlight */}
      <lineSegments
        ref={edgesRef}
        position={[0, 0.4, 0]}
        scale={hovered || isSelected ? 1.15 : 1}
        geometry={edgesGeometry}
      >
        <lineBasicMaterial
          color={project.color}
          transparent
          opacity={hovered || isSelected ? 0.8 : 0.4}
        />
      </lineSegments>

      {/* Inner glowing core */}
      <mesh position={[0, 0.4, 0]} scale={0.25}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={hovered || isSelected ? 3 : 1.5}
        />
      </mesh>

      {/* Water surface reflection glow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        position={[0, 0.4, 0]}
        color={project.color}
        intensity={hovered || isSelected ? 2 : 0.8}
        distance={3}
      />

      {/* HTML Label Card */}
      <Html
        position={[0, 1.2, 0]}
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
