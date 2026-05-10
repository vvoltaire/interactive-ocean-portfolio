'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/projects'
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
  const [hovered, setHovered] = useState(false)
  const Icon = iconMap[project.icon]
  const initialY = useRef(project.position[1])
  const initialRotation = useRef(Math.random() * Math.PI * 2)

  // Create edge geometry for cube outline
  const edgesGeometry = useMemo(() => {
    const box = new THREE.BoxGeometry(0.72, 0.72, 0.72)
    return new THREE.EdgesGeometry(box)
  }, [])

  useFrame((state) => {
    if (groupRef.current && meshRef.current) {
      const time = state.clock.elapsedTime
      const x = project.position[0]
      const z = project.position[2]
      
      // Match the Gerstner wave motion from the water shader
      // Large swells
      const wave1 = Math.sin(((x + z * 0.5) * 2 * Math.PI / 30) - time * 0.4) * 0.15
      const wave2 = Math.sin(((x * 0.7 + z) * 2 * Math.PI / 20) - time * 0.5) * 0.12
      const wave3 = Math.sin(((-x * 0.5 + z * 0.8) * 2 * Math.PI / 15) - time * 0.6) * 0.1
      
      // Medium waves  
      const wave4 = Math.sin(((x + z * 0.3) * 2 * Math.PI / 8) - time * 0.8) * 0.08
      const wave5 = Math.sin(((-x * 0.3 + z) * 2 * Math.PI / 6) - time * 0.9) * 0.06
      
      const totalWaveHeight = wave1 + wave2 + wave3 + wave4 + wave5
      groupRef.current.position.y = initialY.current + totalWaveHeight + 0.4
      
      // Tilt based on wave gradient (like actually floating)
      const tiltX = Math.cos(((x + z * 0.5) * 2 * Math.PI / 30) - time * 0.4) * 0.08
      const tiltZ = Math.cos(((-x * 0.5 + z * 0.8) * 2 * Math.PI / 15) - time * 0.6) * 0.06
      
      meshRef.current.rotation.y = initialRotation.current + time * 0.1
      meshRef.current.rotation.x = tiltX
      meshRef.current.rotation.z = tiltZ
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
        position={[0, 0.4, 0]}
        scale={hovered || isSelected ? 1.15 : 1}
        geometry={edgesGeometry}
        rotation={meshRef.current?.rotation}
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

      {/* Water reflection effect */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.15}
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
