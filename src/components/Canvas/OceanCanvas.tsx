import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import Scene from './Scene'
import { CAMERA_CONFIG, ORBIT_CONTROLS_CONFIG, LIGHTING_CONFIG, PERFORMANCE_CONFIG } from '../../config/constants'

export default function OceanCanvas() {
  const [cameraReady, setCameraReady] = useState(false)

  return (
    <div className="w-full h-screen relative bg-ocean-950">
      <Canvas
        gl={{
          antialias: PERFORMANCE_CONFIG.antialias,
          pixelRatio: PERFORMANCE_CONFIG.pixelRatio,
          precision: 'highp',
          alpha: false,
        }}
        dpr={PERFORMANCE_CONFIG.pixelRatio}
      >
        <PerspectiveCamera
          makeDefault
          fov={CAMERA_CONFIG.fov}
          near={CAMERA_CONFIG.near}
          far={CAMERA_CONFIG.far}
          position={[CAMERA_CONFIG.position.x, CAMERA_CONFIG.position.y, CAMERA_CONFIG.position.z]}
          onUpdate={(cam) => {
            cam.lookAt(CAMERA_CONFIG.lookAt.x, CAMERA_CONFIG.lookAt.y, CAMERA_CONFIG.lookAt.z)
            setCameraReady(true)
          }}
        />

        <OrbitControls
          autoRotate={ORBIT_CONTROLS_CONFIG.autoRotate}
          autoRotateSpeed={ORBIT_CONTROLS_CONFIG.autoRotateSpeed}
          enableDamping={ORBIT_CONTROLS_CONFIG.enableDamping}
          dampingFactor={ORBIT_CONTROLS_CONFIG.dampingFactor}
          enableZoom={ORBIT_CONTROLS_CONFIG.enableZoom}
          zoomSpeed={ORBIT_CONTROLS_CONFIG.zoomSpeed}
          minDistance={ORBIT_CONTROLS_CONFIG.minDistance}
          maxDistance={ORBIT_CONTROLS_CONFIG.maxDistance}
          maxPolarAngle={ORBIT_CONTROLS_CONFIG.maxPolarAngle}
          minPolarAngle={ORBIT_CONTROLS_CONFIG.minPolarAngle}
        />

        <Fog
          attach="fog"
          args={[LIGHTING_CONFIG.fog.color, LIGHTING_CONFIG.fog.near, LIGHTING_CONFIG.fog.far]}
        />

        {cameraReady && <Scene />}
      </Canvas>
    </div>
  )
}
