'use client'

import { useRef } from 'react'
import * as THREE from 'three'

interface ModelProps {
  color: string
  hovered: boolean
  isSelected: boolean
}

// Startpage - 3D Bookmark (ribbon shape)
export function BookmarkModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.5 : 0.2
  
  return (
    <group>
      {/* Main bookmark body - flat ribbon */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.8, 0.06]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.6}
          emissive={color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
      {/* Ribbon notch (V-cut at bottom) */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.06]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.6}
          emissive={color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
      {/* Top fold */}
      <mesh position={[0, 0.75, 0.04]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.04]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.6}
          emissive={color}
          emissiveIntensity={glowIntensity * 1.2}
        />
      </mesh>
    </group>
  )
}

// Raymarcher Studio - Glass Prism (triangular)
export function PrismModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.4 : 0.15
  
  return (
    <group rotation={[0, Math.PI / 6, 0]}>
      {/* Triangular prism using cylinder with 3 sides */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.6, 3]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0}
          transmission={0.85}
          thickness={0.8}
          ior={2.4}
          clearcoat={1}
          clearcoatRoughness={0}
          emissive={color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
      {/* Inner rainbow glow core */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.55, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 2 : 1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}

// Audio Reactive Camera - Vintage Camera
export function CameraModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.4 : 0.15
  
  return (
    <group>
      {/* Camera body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.3]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.6}
          clearcoat={0.3}
        />
      </mesh>
      {/* Lens barrel */}
      <mesh position={[0, 0.25, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.25, 32]} />
        <meshPhysicalMaterial
          color="#2a2a2a"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Lens glass */}
      <mesh position={[0, 0.25, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0}
          metalness={0}
          transmission={0.9}
          thickness={0.2}
          emissive={color}
          emissiveIntensity={glowIntensity * 2}
        />
      </mesh>
      {/* Viewfinder */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.12]} />
        <meshPhysicalMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {/* Flash hotshoe */}
      <mesh position={[0.15, 0.5, 0]} castShadow>
        <boxGeometry args={[0.08, 0.04, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
    </group>
  )
}

// Latent Fractal Zoom - Brass Telescope
export function TelescopeModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.4 : 0.15
  
  return (
    <group rotation={[0.2, 0, 0.1]}>
      {/* Main tube */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.7, 32]} />
        <meshPhysicalMaterial
          color="#b87333"
          roughness={0.3}
          metalness={0.8}
          clearcoat={0.4}
        />
      </mesh>
      {/* Eyepiece */}
      <mesh position={[-0.4, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 32]} />
        <meshPhysicalMaterial
          color="#8b6914"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      {/* Objective lens housing */}
      <mesh position={[0.38, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.08, 32]} />
        <meshPhysicalMaterial
          color="#b87333"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      {/* Lens */}
      <mesh position={[0.43, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <circleGeometry args={[0.09, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0}
          transmission={0.95}
          thickness={0.1}
          emissive={color}
          emissiveIntensity={glowIntensity * 2}
        />
      </mesh>
      {/* Focus ring */}
      <mesh position={[0.1, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.1, 0.02, 8, 32]} />
        <meshPhysicalMaterial
          color="#8b6914"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>
    </group>
  )
}

// Procedural Infinite City - Miniature Skyscraper
export function SkyscraperModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.3 : 0.1
  
  return (
    <group>
      {/* Main tower */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshPhysicalMaterial
          color="#4a5568"
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.5}
        />
      </mesh>
      {/* Windows (glowing strips) */}
      {[0.15, 0.35, 0.55].map((y, i) => (
        <mesh key={i} position={[0.151, y, 0]}>
          <boxGeometry args={[0.01, 0.08, 0.25]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={glowIntensity * (2 + i * 0.5)}
          />
        </mesh>
      ))}
      {/* Roof structure */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshPhysicalMaterial
          color="#2d3748"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.02, 0.2, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity * 3}
        />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshPhysicalMaterial
          color="#1a202c"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}

// Interactive Ocean Portfolio - Paper Boat
export function PaperBoatModel({ color, hovered, isSelected }: ModelProps) {
  const glowIntensity = hovered || isSelected ? 0.4 : 0.15
  
  return (
    <group>
      {/* Hull - bottom V shape */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.2, 4]} />
        <meshPhysicalMaterial
          color="#f5f5f5"
          roughness={0.7}
          metalness={0}
          clearcoat={0.2}
        />
      </mesh>
      {/* Left sail */}
      <mesh position={[-0.08, 0.4, 0]} rotation={[0, 0, 0.15]} castShadow>
        <coneGeometry args={[0.2, 0.45, 3]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.5}
          metalness={0}
          emissive={color}
          emissiveIntensity={glowIntensity}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right sail */}
      <mesh position={[0.08, 0.4, 0]} rotation={[0, Math.PI, -0.15]} castShadow>
        <coneGeometry args={[0.18, 0.4, 3]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.5}
          metalness={0}
          emissive={color}
          emissiveIntensity={glowIntensity * 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Mast */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} />
        <meshStandardMaterial
          color="#d4a574"
          roughness={0.6}
        />
      </mesh>
    </group>
  )
}

// Model selector based on project ID
export function getProjectModel(projectId: string) {
  switch (projectId) {
    case 'startpage':
      return BookmarkModel
    case 'raymarcher-studio':
      return PrismModel
    case 'audio-reactive-camera':
      return CameraModel
    case 'latent-fractal-zoom':
      return TelescopeModel
    case 'procedural-infinite-city':
      return SkyscraperModel
    case 'interactive-ocean-portfolio':
      return PaperBoatModel
    default:
      return BookmarkModel
  }
}
