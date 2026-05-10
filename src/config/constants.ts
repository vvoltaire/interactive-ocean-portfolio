// Camera Configuration
export const CAMERA_CONFIG = {
  fov: 75,
  near: 0.1,
  far: 10000,
  position: {
    x: 0,
    y: 8,
    z: 30,
  },
  lookAt: {
    x: 0,
    y: 0,
    z: 0,
  },
}

// Orbit Controls Configuration
export const ORBIT_CONTROLS_CONFIG = {
  autoRotate: false,
  autoRotateSpeed: 0.5,
  enableDamping: true,
  dampingFactor: 0.05,
  enableZoom: true,
  zoomSpeed: 1.2,
  minDistance: 15,
  maxDistance: 80,
  maxPolarAngle: Math.PI * 0.75,
  minPolarAngle: Math.PI * 0.25,
}

// Water Configuration
export const WATER_CONFIG = {
  planeWidth: 1000,
  planeHeight: 1000,
  widthSegments: 128,
  heightSegments: 128,
  waveAmplitude: 0.5,
  waveFrequency: 2,
  waveSpeed: 0.4,
  color: '#1a5f7a',
  emissive: '#0a2f42',
  metalness: 0.2,
  roughness: 0.7,
}

// Lighting Configuration
export const LIGHTING_CONFIG = {
  ambient: {
    color: '#ffffff',
    intensity: 0.6,
  },
  directional: {
    color: '#ffffff',
    intensity: 1.2,
    position: {
      x: 100,
      y: 150,
      z: 100,
    },
    castShadow: true,
    shadowMapSize: 2048,
  },
  fog: {
    color: '#1a2942',
    near: 50,
    far: 500,
  },
}

// Sky/Environment Configuration
export const SKY_CONFIG = {
  preset: 'sunset',
  background: '#0f1e3a',
}

// Animation Timings
export const ANIMATION_CONFIG = {
  cameraTransitionDuration: 1.2,
  hoverAnimationDuration: 0.3,
  scrollTransitionDuration: 0.8,
  bobbing: {
    amplitude: 0.3,
    frequency: 2,
  },
  rotation: {
    speed: 0.3,
  },
}

// UI Configuration
export const UI_CONFIG = {
  projectCardScale: 1.1,
  hoverGlowIntensity: 1.5,
  rippleMaxRadius: 20,
  rippleDuration: 0.8,
}

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  antialias: true,
  maxFPS: 60,
}
