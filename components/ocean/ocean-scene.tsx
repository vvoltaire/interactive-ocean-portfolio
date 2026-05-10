'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { SeaWater } from './water'
import { Sky } from './sky'
import { FloatingProject } from './floating-project'
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

function Scene({ onSelectProject, selectedProject }: OceanSceneProps) {
  return (
    <>
      <CameraController selectedProject={selectedProject} />
      
      {/* Sky dome with clouds */}
      <Sky />
      
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Main sun light */}
      <directionalLight
        position={[50, 60, -30]}
        intensity={2}
        color="#fff8e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-30, 20, 30]}
        intensity={0.5}
        color="#a8d4f0"
      />
      
      {/* Hemisphere light for sky/ground color */}
      <hemisphereLight
        args={['#87ceeb', '#1a6ba3', 0.4]}
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
