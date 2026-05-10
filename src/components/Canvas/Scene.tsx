import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, ShaderMaterial, Vector2 } from 'three'
import { LIGHTING_CONFIG, WATER_CONFIG, SKY_CONFIG } from '../../config/constants'
import OceanPlane from './OceanPlane'

export default function Scene() {
  const sceneRef = useRef(null)

  return (
    <>
      {/* Ambient Light */}
      <ambientLight
        color={LIGHTING_CONFIG.ambient.color}
        intensity={LIGHTING_CONFIG.ambient.intensity}
      />

      {/* Directional Light (Sun) */}
      <directionalLight
        color={LIGHTING_CONFIG.directional.color}
        intensity={LIGHTING_CONFIG.directional.intensity}
        position={[
          LIGHTING_CONFIG.directional.position.x,
          LIGHTING_CONFIG.directional.position.y,
          LIGHTING_CONFIG.directional.position.z,
        ]}
        castShadow={LIGHTING_CONFIG.directional.castShadow}
        shadow-mapSize-width={LIGHTING_CONFIG.directional.shadowMapSize}
        shadow-mapSize-height={LIGHTING_CONFIG.directional.shadowMapSize}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />

      {/* Ocean Plane */}
      <OceanPlane />

      {/* Reference for frame updates */}
      <group ref={sceneRef} />
    </>
  )
}
