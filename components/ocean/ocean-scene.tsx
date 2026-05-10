'use client'

import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { SeaWater } from './water'
import { DynamicSky, type TimeOfDayConfig } from './sky'
import { FloatingProject } from './floating-project'
import { SpatialInteractionsPanel } from './spatial-ui'
import { projects, type Project } from '@/lib/projects'

interface OceanSceneProps {
  onSelectProject: (project: Project | null) => void
  selectedProject: Project | null
}

function CameraController({ selectedProject }: { selectedProject: Project | null }) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 3, 15))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -20))

  useEffect(() => {
    if (selectedProject) {
      const [x, y, z] = selectedProject.position
      targetPosition.current.set(x + 4, y + 2.5, z + 6)
      targetLookAt.current.set(x, y, z)
    } else {
      // Default view - looking towards horizon
      targetPosition.current.set(0, 3, 15)
      targetLookAt.current.set(0, 0, -20)
    }
  }, [selectedProject])

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.02)
  })

  return null
}

// Dynamic lighting that follows the sun and sky config
function DynamicLighting({ skyConfig }: { skyConfig: TimeOfDayConfig | null }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  
  if (!skyConfig) return null
  
  const [sx, sy, sz] = skyConfig.sunPosition
  const sunHeight = sy / 100 // Normalize since sunPosition is at distance 100
  
  // Adjust light color based on config
  const lightColor = new THREE.Color(skyConfig.lightColor)
  
  return (
    <>
      {/* Main sun/moon light */}
      <directionalLight
        ref={lightRef}
        position={[sx, Math.max(sy, 10), sz]}
        intensity={skyConfig.lightIntensity}
        color={lightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0001}
      />
      
      {/* Ambient light - varies with time of day */}
      <ambientLight 
        intensity={skyConfig.ambientIntensity} 
        color={skyConfig.isNight ? '#1a2a4a' : '#ffffff'} 
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-sx * 0.5, Math.max(sy * 0.3, 5), -sz * 0.5]}
        intensity={skyConfig.isNight ? 0.1 : 0.4}
        color={skyConfig.isNight ? '#4a5a8a' : '#a8d4f0'}
      />
      
      {/* Hemisphere light for sky/ground ambient */}
      <hemisphereLight
        args={[
          skyConfig.isNight ? '#1a2a4a' : '#87ceeb', // Sky color
          '#1a5a8a', // Ground/water reflection color
          skyConfig.isNight ? 0.1 : 0.35
        ]}
      />
    </>
  )
}

function Scene({ onSelectProject, selectedProject }: OceanSceneProps) {
  const [skyConfig, setSkyConfig] = useState<TimeOfDayConfig | null>(null)
  
  const handleSkyConfigChange = useCallback((config: TimeOfDayConfig) => {
    setSkyConfig(config)
  }, [])

  return (
    <>
      <CameraController selectedProject={selectedProject} />
      
      {/* Dynamic sky with time-based sun position */}
      <DynamicSky 
        onConfigChange={handleSkyConfigChange}
        // Uncomment below to override time for testing:
        // overrideHour={12} // Noon
        // overrideHour={6.5} // Sunrise
        // overrideHour={19} // Sunset
        // overrideHour={23} // Night
      />
      
      {/* Dynamic lighting linked to sky */}
      <DynamicLighting skyConfig={skyConfig} />

      {/* Sea water surface - extends to horizon */}
      <SeaWater position={[0, 0, 0]} />

      {/* Floating project cubes */}
      {projects.map((project) => (
        <FloatingProject
          key={project.id}
          project={project}
          onSelect={onSelectProject}
          isSelected={selectedProject?.id === project.id}
        />
      ))}
      
      {/* Spatial UI - floating glassmorphism panel (lower-left, visible from start) */}
      <SpatialInteractionsPanel 
        position={[-8, 1.8, 8]} 
        rotation={[0, 0.4, 0]}
        scale={0.7}
      />
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={8}
        maxDistance={40}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function OceanScene({ onSelectProject, selectedProject }: OceanSceneProps) {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 3, 15], fov: 60, near: 0.1, far: 500000 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
        }}
        shadows="basic"
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene onSelectProject={onSelectProject} selectedProject={selectedProject} />
        </Suspense>
      </Canvas>
    </div>
  )
}
