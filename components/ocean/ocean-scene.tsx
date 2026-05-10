'use client'

import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { SeaWater } from './water'
import { Sky, calculateSunPosition } from './sky'
import { FloatingProject } from './floating-project'
import { SpatialInteractionsPanel } from './spatial-ui'
import { projects, type Project } from '@/lib/projects'

interface OceanSceneProps {
  onSelectProject: (project: Project | null) => void
  selectedProject: Project | null
}

// Sun configuration for time of day
const SUN_CONFIG = {
  elevation: 0.38, // Radians above horizon (golden hour)
  azimuth: -0.3, // Direction angle
  turbidity: 2.0, // Atmospheric haze (lower = clearer)
  rayleigh: 1.2, // Blue sky intensity
  mieCoefficient: 0.005, // Sun haze
  mieDirectionalG: 0.8, // Sun glow spread
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

// Dynamic lighting that follows the sun
function SunLight({ sunPosition }: { sunPosition: THREE.Vector3 }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  
  // Calculate light color based on sun height
  const sunHeight = sunPosition.y / sunPosition.length()
  
  // Color shifts from warm white to orange/red as sun gets lower
  const lightColor = new THREE.Color()
  if (sunHeight > 0.3) {
    lightColor.setHex(0xfff8e6) // Warm white
  } else if (sunHeight > 0.1) {
    const t = (sunHeight - 0.1) / 0.2
    lightColor.setRGB(
      1.0,
      0.85 + t * 0.1,
      0.65 + t * 0.25
    )
  } else {
    const t = Math.max(0, sunHeight / 0.1)
    lightColor.setRGB(
      1.0,
      0.7 + t * 0.15,
      0.4 + t * 0.25
    )
  }
  
  // Intensity based on sun height
  const intensity = Math.max(0.5, Math.min(2.5, sunHeight * 4 + 0.8))
  
  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(sunPosition)
      lightRef.current.color.copy(lightColor)
      lightRef.current.intensity = intensity
    }
  }, [sunPosition, lightColor, intensity])

  return (
    <directionalLight
      ref={lightRef}
      position={[sunPosition.x * 100, sunPosition.y * 100, sunPosition.z * 100]}
      intensity={intensity}
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
  )
}

function Scene({ onSelectProject, selectedProject }: OceanSceneProps) {
  const [sunPosition, setSunPosition] = useState(() => 
    calculateSunPosition(SUN_CONFIG.elevation, SUN_CONFIG.azimuth).multiplyScalar(100)
  )
  
  const handleSunPositionChange = useCallback((pos: THREE.Vector3) => {
    setSunPosition(pos)
  }, [])

  // Calculate ambient and fill light colors based on sun position
  const sunHeight = sunPosition.y / sunPosition.length()
  const ambientColor = sunHeight > 0.2 
    ? new THREE.Color(0xffffff)
    : new THREE.Color().setRGB(1.0, 0.95, 0.9)
  const ambientIntensity = 0.4 + sunHeight * 0.3

  return (
    <>
      <CameraController selectedProject={selectedProject} />
      
      {/* Dynamic sky with atmospheric scattering */}
      <Sky 
        sunElevation={SUN_CONFIG.elevation}
        sunAzimuth={SUN_CONFIG.azimuth}
        turbidity={SUN_CONFIG.turbidity}
        rayleigh={SUN_CONFIG.rayleigh}
        mieCoefficient={SUN_CONFIG.mieCoefficient}
        mieDirectionalG={SUN_CONFIG.mieDirectionalG}
        onSunPositionChange={handleSunPositionChange}
      />
      
      {/* Ambient light - color shifts with time of day */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />
      
      {/* Main sun light - position and color linked to sky */}
      <SunLight sunPosition={sunPosition} />
      
      {/* Fill light from opposite side - cooler tone */}
      <directionalLight
        position={[-sunPosition.x * 0.5, sunPosition.y * 0.3, -sunPosition.z * 0.5]}
        intensity={0.4}
        color="#a8d4f0"
      />
      
      {/* Hemisphere light for sky/ground ambient */}
      <hemisphereLight
        args={[
          sunHeight > 0.2 ? '#87ceeb' : '#c4a875', // Sky color
          '#1a5a8a', // Ground/water reflection color
          0.35
        ]}
      />

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
      
      {/* Spatial UI - floating glassmorphism panel (bottom-right, smaller) */}
      <SpatialInteractionsPanel 
        position={[14, 1.5, 10]} 
        rotation={[0, -0.6, 0]}
        scale={0.65}
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
        camera={{ position: [0, 3, 15], fov: 60, near: 0.1, far: 2000 }}
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
