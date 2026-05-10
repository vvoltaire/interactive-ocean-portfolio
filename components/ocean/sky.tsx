'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SkyProps {
  // Sun elevation angle in radians (0 = horizon, PI/2 = zenith)
  sunElevation?: number
  // Sun azimuth angle in radians
  sunAzimuth?: number
  // Atmospheric turbidity (1-10, higher = hazier)
  turbidity?: number
  // Rayleigh scattering coefficient (affects blue sky color)
  rayleigh?: number
  // Mie scattering coefficient (affects sun haze)
  mieCoefficient?: number
  // Mie directional factor (affects sun glow spread)
  mieDirectionalG?: number
  // Callback to get sun position for lighting
  onSunPositionChange?: (position: THREE.Vector3) => void
}

export function Sky({
  sunElevation = 0.35, // Slightly above horizon for golden hour feel
  sunAzimuth = 0.2,
  turbidity = 2.5,
  rayleigh = 1.5,
  mieCoefficient = 0.005,
  mieDirectionalG = 0.8,
  onSunPositionChange,
}: SkyProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const sunPositionRef = useRef(new THREE.Vector3())

  // Calculate sun position from elevation and azimuth
  const sunPosition = useMemo(() => {
    const phi = Math.PI / 2 - sunElevation
    const theta = sunAzimuth
    const pos = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    ).normalize()
    sunPositionRef.current.copy(pos)
    return pos
  }, [sunElevation, sunAzimuth])

  // Notify parent of sun position changes
  useMemo(() => {
    if (onSunPositionChange) {
      onSunPositionChange(sunPosition.clone().multiplyScalar(100))
    }
  }, [sunPosition, onSunPositionChange])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunPosition: { value: sunPosition },
      uTurbidity: { value: turbidity },
      uRayleigh: { value: rayleigh },
      uMieCoefficient: { value: mieCoefficient },
      uMieDirectionalG: { value: mieDirectionalG },
      // Precomputed scattering coefficients
      uBetaR: { value: new THREE.Vector3(5.5e-6, 13.0e-6, 22.4e-6) }, // Rayleigh
      uBetaM: { value: new THREE.Vector3(21e-6, 21e-6, 21e-6) }, // Mie
    }),
    [sunPosition, turbidity, rayleigh, mieCoefficient, mieDirectionalG]
  )

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;
    
    uniform vec3 uSunPosition;
    uniform float uTurbidity;
    uniform float uRayleigh;
    uniform float uMieCoefficient;
    uniform vec3 uBetaR;
    uniform vec3 uBetaM;
    
    // Constants for atmospheric scattering
    const float e = 2.71828182845904523536;
    const float pi = 3.141592653589793238;
    const float n = 1.0003; // Refractive index of air
    const float N = 2.545E25; // Molecular density at sea level
    const float pn = 0.035; // Depolarization factor for air
    const vec3 lambda = vec3(680E-9, 550E-9, 450E-9); // RGB wavelengths
    const vec3 K = vec3(0.686, 0.678, 0.666); // Mie K factor
    const float v = 4.0; // Mie v factor
    
    // Earth shadow depth
    const float cutoffAngle = 1.6110731556870734; // = pi / 1.95
    const float steepness = 1.5;
    const float EE = 1000.0;
    
    float sunIntensity(float zenithAngleCos) {
      zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);
      return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos)) / steepness)));
    }
    
    vec3 totalMie(vec3 lambda, float T) {
      float c = (0.2 * T) * 10E-18;
      return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
    }
    
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      
      vSunDirection = normalize(uSunPosition);
      vSunE = sunIntensity(dot(vSunDirection, vec3(0.0, 1.0, 0.0)));
      vSunfade = 1.0 - clamp(1.0 - exp((uSunPosition.y / 450000.0)), 0.0, 1.0);
      
      float rayleighCoefficient = uRayleigh - (1.0 * (1.0 - vSunfade));
      
      // Rayleigh scattering with wavelength dependence
      vBetaR = uBetaR * rayleighCoefficient;
      
      // Mie scattering
      vBetaM = totalMie(lambda, uTurbidity) * uMieCoefficient;
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform float uMieDirectionalG;
    uniform float uTurbidity;
    
    varying vec3 vWorldPosition;
    varying vec3 vSunDirection;
    varying float vSunfade;
    varying vec3 vBetaR;
    varying vec3 vBetaM;
    varying float vSunE;
    
    const float pi = 3.141592653589793238;
    const float THREE_OVER_SIXTEEN_PI = 0.05968310365946075;
    const float ONE_OVER_FOUR_PI = 0.07957747154594767;
    
    // Rayleigh phase function
    float rayleighPhase(float cosTheta) {
      return THREE_OVER_SIXTEEN_PI * (1.0 + pow(cosTheta, 2.0));
    }
    
    // Henyey-Greenstein phase function for Mie scattering
    float hgPhase(float cosTheta, float g) {
      float g2 = pow(g, 2.0);
      float inverse = 1.0 / pow(1.0 - 2.0 * g * cosTheta + g2, 1.5);
      return ONE_OVER_FOUR_PI * ((1.0 - g2) * inverse);
    }
    
    // Hash functions for noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    // FBM for volumetric clouds
    float fbm(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      float maxValue = 0.0;
      
      for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value / maxValue;
    }
    
    void main() {
      vec3 direction = normalize(vWorldPosition - cameraPosition);
      float height = direction.y;
      
      // Optical length (distance through atmosphere)
      // Using approximation for computational efficiency
      float zenithAngle = acos(max(0.0, height));
      float inverse = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
      float sR = 8.4E3 * inverse; // Rayleigh scale height
      float sM = 1.25E3 * inverse; // Mie scale height
      
      // Combined extinction coefficient
      vec3 Fex = exp(-(vBetaR * sR + vBetaM * sM));
      
      // In-scattering
      float cosTheta = dot(direction, vSunDirection);
      float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);
      vec3 betaRTheta = vBetaR * rPhase;
      
      float mPhase = hgPhase(cosTheta, uMieDirectionalG);
      vec3 betaMTheta = vBetaM * mPhase;
      
      // Sun disk
      float sunAngularDiameter = 0.0093; // Approximate angular diameter
      float sunDiskIntensity = smoothstep(cos(sunAngularDiameter), 1.0, cosTheta);
      
      // Final sky color from scattering
      vec3 Lin = pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * (1.0 - Fex), vec3(1.5));
      Lin *= mix(vec3(1.0), pow(vSunE * ((betaRTheta + betaMTheta) / (vBetaR + vBetaM)) * Fex, vec3(0.5)), clamp(pow(1.0 - dot(vec3(0.0, 1.0, 0.0), vSunDirection), 5.0), 0.0, 1.0));
      
      // Composition + solar disc
      vec3 L0 = vec3(0.1) * Fex;
      L0 += vSunE * 19000.0 * Fex * sunDiskIntensity;
      
      vec3 texColor = (Lin + L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);
      
      // Tone mapping
      vec3 color = pow(texColor, vec3(1.0 / (1.2 + (1.2 * vSunfade))));
      color = 1.0 - exp(-1.0 * color);
      
      // Add clouds above horizon
      if (height > 0.02) {
        vec2 cloudUv = direction.xz / (direction.y + 0.3);
        cloudUv += vec2(uTime * 0.002, uTime * 0.0008);
        
        // Multiple cloud layers for depth
        float cloudLayer1 = fbm(cloudUv * 0.35, 5);
        float cloudLayer2 = fbm(cloudUv * 0.7 + vec2(50.0, 30.0), 4);
        
        float cloudDensity1 = smoothstep(0.42, 0.62, cloudLayer1);
        float cloudDensity2 = smoothstep(0.48, 0.68, cloudLayer2) * 0.5;
        float totalCloud = max(cloudDensity1, cloudDensity2);
        
        // Cloud coloring based on sun position
        float sunHeight = vSunDirection.y;
        vec3 cloudColorBright = vec3(1.0);
        vec3 cloudColorDark = vec3(0.75, 0.78, 0.85);
        
        // Sunset/sunrise coloring
        if (sunHeight < 0.3) {
          float sunsetFactor = 1.0 - sunHeight / 0.3;
          cloudColorBright = mix(cloudColorBright, vec3(1.0, 0.85, 0.7), sunsetFactor * 0.6);
          cloudColorDark = mix(cloudColorDark, vec3(0.9, 0.65, 0.5), sunsetFactor * 0.4);
        }
        
        // Cloud self-shadowing
        float cloudShading = fbm(cloudUv * 1.2 + vec2(100.0), 3);
        vec3 cloudColor = mix(cloudColorDark, cloudColorBright, cloudShading);
        
        // Sun illumination on clouds
        float cloudSunDot = max(0.0, dot(vec3(direction.x, 0.0, direction.z), vec3(vSunDirection.x, 0.0, vSunDirection.z)));
        cloudColor += vec3(0.12, 0.08, 0.02) * cloudSunDot * totalCloud * (1.0 - sunHeight);
        
        // Fade clouds near horizon
        float horizonFade = smoothstep(0.02, 0.2, height);
        totalCloud *= horizonFade;
        
        color = mix(color, cloudColor, totalCloud * 0.85);
      }
      
      // Horizon haze
      float horizonHaze = pow(1.0 - abs(height), 16.0) * 0.3;
      vec3 hazeColor = mix(vec3(0.85, 0.9, 0.95), vec3(1.0, 0.9, 0.8), max(0.0, 1.0 - vSunDirection.y * 3.0));
      color = mix(color, hazeColor, horizonHaze);
      
      // Ensure minimum brightness for visibility
      color = max(color, vec3(0.02));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[900, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// Export sun position calculator for use in other components
export function calculateSunPosition(elevation: number, azimuth: number): THREE.Vector3 {
  const phi = Math.PI / 2 - elevation
  const theta = azimuth
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  ).normalize()
}
