'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky as DreiSky, Stars } from '@react-three/drei'
import * as THREE from 'three'

interface TimeOfDayConfig {
  sunPosition: [number, number, number]
  turbidity: number
  rayleigh: number
  mieCoefficient: number
  mieDirectionalG: number
  isNight: boolean
  lightColor: string
  lightIntensity: number
  ambientIntensity: number
}

// Calculate sun position based on hour (0-24)
function getSunPositionFromHour(hour: number): [number, number, number] {
  // Map hour to angle: 6AM = sunrise (east), 12PM = zenith (south), 6PM = sunset (west)
  // Sun rises at 6, peaks at 12, sets at 18
  
  // Normalize hour to 0-24 range
  const h = ((hour % 24) + 24) % 24
  
  // Calculate elevation angle
  // 6AM: sun at horizon (0°), 12PM: highest point (~60°), 6PM: horizon again
  let elevation: number
  if (h >= 6 && h <= 18) {
    // Daytime: sine wave from 0 to peak at noon back to 0
    const dayProgress = (h - 6) / 12 // 0 at 6AM, 0.5 at noon, 1 at 6PM
    elevation = Math.sin(dayProgress * Math.PI) * 60 // Peak at 60 degrees
  } else {
    // Nighttime: sun below horizon
    const nightProgress = h >= 18 ? (h - 18) / 12 : (h + 6) / 12
    elevation = -10 - Math.sin(nightProgress * Math.PI) * 20 // Below horizon
  }
  
  // Calculate azimuth (east to west arc)
  // 6AM: east (90°), 12PM: south (180°), 6PM: west (270°)
  let azimuth: number
  if (h >= 6 && h <= 18) {
    azimuth = 90 + ((h - 6) / 12) * 180 // 90° to 270°
  } else {
    // Night: sun on the other side
    const nightH = h >= 18 ? h - 18 : h + 6
    azimuth = 270 + (nightH / 12) * 180 // 270° to 450° (90°)
  }
  
  // Convert to radians and calculate position
  const elevRad = (elevation * Math.PI) / 180
  const azimRad = (azimuth * Math.PI) / 180
  
  const distance = 100
  const x = distance * Math.cos(elevRad) * Math.sin(azimRad)
  const y = distance * Math.sin(elevRad)
  const z = distance * Math.cos(elevRad) * Math.cos(azimRad)
  
  return [x, y, z]
}

// Get sky configuration based on time of day
function getTimeOfDayConfig(hour: number): TimeOfDayConfig {
  const h = ((hour % 24) + 24) % 24
  const sunPosition = getSunPositionFromHour(h)
  
  // Night time: 9 PM to 5 AM
  if (h >= 21 || h < 5) {
    return {
      sunPosition,
      turbidity: 10,
      rayleigh: 0.1,
      mieCoefficient: 0.001,
      mieDirectionalG: 0.7,
      isNight: true,
      lightColor: '#1a2a4a',
      lightIntensity: 0.15,
      ambientIntensity: 0.1,
    }
  }
  
  // Sunrise: 5 AM to 8 AM
  if (h >= 5 && h < 8) {
    const progress = (h - 5) / 3 // 0 to 1
    return {
      sunPosition,
      turbidity: 4 - progress * 2, // 4 to 2
      rayleigh: 1.5 + progress * 1, // 1.5 to 2.5
      mieCoefficient: 0.01 - progress * 0.005, // 0.01 to 0.005
      mieDirectionalG: 0.9,
      isNight: false,
      lightColor: progress < 0.5 ? '#ffb366' : '#ffd699',
      lightIntensity: 0.5 + progress * 1.0,
      ambientIntensity: 0.2 + progress * 0.2,
    }
  }
  
  // Morning/Midday: 8 AM to 4 PM (deep blue sky)
  if (h >= 8 && h < 16) {
    return {
      sunPosition,
      turbidity: 1.5, // Clear sky
      rayleigh: 3.0, // Strong blue - deep saturated sky
      mieCoefficient: 0.003,
      mieDirectionalG: 0.75,
      isNight: false,
      lightColor: '#fff8f0',
      lightIntensity: 2.0,
      ambientIntensity: 0.45,
    }
  }
  
  // Afternoon: 4 PM to 6 PM (transitioning to golden hour)
  if (h >= 16 && h < 18) {
    const progress = (h - 16) / 2
    return {
      sunPosition,
      turbidity: 1.5 + progress * 2,
      rayleigh: 3.0 - progress * 0.5,
      mieCoefficient: 0.003 + progress * 0.005,
      mieDirectionalG: 0.75 + progress * 0.1,
      isNight: false,
      lightColor: progress < 0.5 ? '#fff0d6' : '#ffd699',
      lightIntensity: 2.0 - progress * 0.3,
      ambientIntensity: 0.45 - progress * 0.1,
    }
  }
  
  // Sunset: 6 PM to 9 PM
  if (h >= 18 && h < 21) {
    const progress = (h - 18) / 3 // 0 to 1
    return {
      sunPosition,
      turbidity: 3.5 + progress * 4,
      rayleigh: 2.5 - progress * 2,
      mieCoefficient: 0.008 + progress * 0.005,
      mieDirectionalG: 0.85 + progress * 0.1,
      isNight: progress > 0.8,
      lightColor: progress < 0.5 ? '#ff9966' : '#cc6633',
      lightIntensity: 1.7 - progress * 1.2,
      ambientIntensity: 0.35 - progress * 0.2,
    }
  }
  
  // Default fallback (shouldn't reach here)
  return {
    sunPosition,
    turbidity: 2,
    rayleigh: 2.5,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    isNight: false,
    lightColor: '#ffffff',
    lightIntensity: 1.5,
    ambientIntensity: 0.4,
  }
}

interface DynamicSkyProps {
  // Override time (0-24), if not provided uses local time
  overrideHour?: number
  // Callback to notify parent of sky configuration changes
  onConfigChange?: (config: TimeOfDayConfig) => void
}

export function DynamicSky({ overrideHour, onConfigChange }: DynamicSkyProps) {
  const [currentHour, setCurrentHour] = useState(() => {
    if (overrideHour !== undefined) return overrideHour
    const now = new Date()
    return now.getHours() + now.getMinutes() / 60
  })
  
  // Update time periodically (every minute) if using real time
  useEffect(() => {
    if (overrideHour !== undefined) {
      setCurrentHour(overrideHour)
      return
    }
    
    const updateTime = () => {
      const now = new Date()
      setCurrentHour(now.getHours() + now.getMinutes() / 60)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [overrideHour])
  
  const config = useMemo(() => getTimeOfDayConfig(currentHour), [currentHour])
  
  // Notify parent of config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config)
    }
  }, [config, onConfigChange])
  
  return (
    <>
      {/* Main sky dome using drei's Sky component */}
      <DreiSky
        distance={450000}
        sunPosition={config.sunPosition}
        inclination={0}
        azimuth={0.25}
        turbidity={config.turbidity}
        rayleigh={config.rayleigh}
        mieCoefficient={config.mieCoefficient}
        mieDirectionalG={config.mieDirectionalG}
      />
      
      {/* Stars visible at night */}
      {config.isNight && (
        <Stars
          radius={300}
          depth={60}
          count={4000}
          factor={5}
          saturation={0.2}
          fade
          speed={0.5}
        />
      )}
    </>
  )
}

// Export the config type and helper functions for use in other components
export type { TimeOfDayConfig }
export { getTimeOfDayConfig, getSunPositionFromHour }

// Legacy export for backward compatibility
export function calculateSunPosition(elevation: number, azimuth: number): THREE.Vector3 {
  const phi = Math.PI / 2 - elevation
  const theta = azimuth
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize()
}
