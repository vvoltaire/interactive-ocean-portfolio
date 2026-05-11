// Shared wave calculation utilities for consistent buoyancy physics
// These match the Gerstner wave parameters in the water shader

export interface WaveResult {
  height: number
  normal: [number, number, number]
}

// Wave configuration matching the shader
const WAVE_CONFIGS = [
  // Primary swells
  { steepness: 0.20, wavelength: 45, direction: [1.0, 0.6], speed: 0.35 },
  { steepness: 0.15, wavelength: 32, direction: [0.8, 1.0], speed: 0.42 },
  { steepness: 0.12, wavelength: 25, direction: [-0.4, 0.9], speed: 0.48 },
  // Medium waves
  { steepness: 0.08, wavelength: 12, direction: [1.0, 0.2], speed: 0.7 },
  { steepness: 0.06, wavelength: 8, direction: [-0.2, 1.0], speed: 0.85 },
  { steepness: 0.05, wavelength: 6, direction: [0.7, -0.7], speed: 0.95 },
  // Small chop
  { steepness: 0.035, wavelength: 3.5, direction: [1.0, 0.5], speed: 1.3 },
  { steepness: 0.025, wavelength: 2.5, direction: [-0.5, 1.0], speed: 1.5 },
  { steepness: 0.02, wavelength: 1.8, direction: [0.8, 0.6], speed: 1.8 },
]

// Simple noise function for detail
function pseudoNoise(x: number, z: number, t: number): number {
  return (
    Math.sin(x * 0.15 + t * 0.25) * Math.cos(z * 0.15 + t * 0.2) * 0.12 +
    Math.sin(x * 0.35 + t * 0.4) * Math.cos(z * 0.35 + t * 0.35) * 0.06 +
    Math.sin(x * 0.8 + t * 0.6) * Math.cos(z * 0.8 + t * 0.5) * 0.03
  )
}

// Calculate Gerstner wave displacement and derivatives
function gerstnerWave(
  x: number,
  z: number,
  steepness: number,
  wavelength: number,
  direction: number[],
  time: number,
  choppiness: number
): { displacement: [number, number, number]; tangent: [number, number, number]; binormal: [number, number, number] } {
  const k = (2 * Math.PI) / wavelength
  const c = Math.sqrt(9.81 / k)
  const dirLen = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1])
  const dx = direction[0] / dirLen
  const dz = direction[1] / dirLen
  const f = k * (dx * x + dz * z - c * time)
  const a = (steepness * choppiness) / k

  const sinF = Math.sin(f)
  const cosF = Math.cos(f)

  return {
    displacement: [dx * a * cosF, a * sinF, dz * a * cosF],
    tangent: [
      1 - dx * dx * steepness * choppiness * sinF,
      dx * steepness * choppiness * cosF,
      -dx * dz * steepness * choppiness * sinF,
    ],
    binormal: [
      -dx * dz * steepness * choppiness * sinF,
      dz * steepness * choppiness * cosF,
      1 - dz * dz * steepness * choppiness * sinF,
    ],
  }
}

// Cross product for normal calculation
function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

// Normalize vector
function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  if (len === 0) return [0, 1, 0]
  return [v[0] / len, v[1] / len, v[2] / len]
}

/**
 * Calculate wave height and surface normal at a given world position
 * Matches the Gerstner wave calculations in the water shader
 * Default choppiness reduced to 0.6 for calmer water
 */
export function getWaveData(x: number, z: number, time: number, choppiness: number = 0.6): WaveResult {
  let totalHeight = 0
  let tangent: [number, number, number] = [1, 0, 0]
  let binormal: [number, number, number] = [0, 0, 1]

  // Accumulate all Gerstner waves
  for (const wave of WAVE_CONFIGS) {
    const result = gerstnerWave(x, z, wave.steepness, wave.wavelength, wave.direction, time * wave.speed, choppiness)

    totalHeight += result.displacement[1]

    // Accumulate tangent and binormal offsets
    tangent[0] += result.tangent[0] - 1
    tangent[1] += result.tangent[1]
    tangent[2] += result.tangent[2]

    binormal[0] += result.binormal[0]
    binormal[1] += result.binormal[1]
    binormal[2] += result.binormal[2] - 1
  }

  // Add noise detail
  totalHeight += pseudoNoise(x, z, time)

  // Calculate normal from tangent and binormal
  const normal = normalize(cross(binormal, tangent))

  return {
    height: totalHeight,
    normal,
  }
}

/**
 * Calculate rotation angles from wave normal for realistic tilting
 * Returns [rotationX, rotationZ] in radians
 */
export function getNormalRotation(normal: [number, number, number]): [number, number] {
  // Convert normal to rotation angles
  // rotationX: tilt forward/backward based on normal.z
  // rotationZ: tilt left/right based on normal.x
  const rotationX = Math.asin(-normal[2]) * 0.7 // Scale down for subtler effect
  const rotationZ = Math.asin(normal[0]) * 0.7
  
  return [rotationX, rotationZ]
}
