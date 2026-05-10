'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSkyTop: { value: new THREE.Color('#3a7dc9') },
      uSkyMiddle: { value: new THREE.Color('#6aade6') },
      uSkyHorizon: { value: new THREE.Color('#b8d8f0') },
      uSunColor: { value: new THREE.Color('#fff8e0') },
      uSunPosition: { value: new THREE.Vector3(0.3, 0.5, -0.4).normalize() },
    }),
    []
  )

  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vDirection;
    
    void main() {
      vWorldPosition = position;
      vDirection = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uSkyTop;
    uniform vec3 uSkyMiddle;
    uniform vec3 uSkyHorizon;
    uniform vec3 uSunColor;
    uniform vec3 uSunPosition;
    
    varying vec3 vWorldPosition;
    varying vec3 vDirection;
    
    // Hash functions for noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
    }
    
    // Smooth noise
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
    
    // FBM for realistic clouds
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
      vec3 direction = normalize(vDirection);
      float height = direction.y;
      
      // Multi-stop sky gradient for realistic atmosphere
      vec3 skyColor;
      if (height > 0.4) {
        // Upper sky - deep blue
        float t = (height - 0.4) / 0.6;
        skyColor = mix(uSkyMiddle, uSkyTop, pow(t, 0.7));
      } else if (height > 0.0) {
        // Lower sky - gradient to horizon
        float t = height / 0.4;
        skyColor = mix(uSkyHorizon, uSkyMiddle, pow(t, 0.5));
      } else {
        // Below horizon - slightly darker
        skyColor = uSkyHorizon * 0.9;
      }
      
      // Sun
      float sunDot = dot(direction, uSunPosition);
      
      // Sun disk with soft edge
      float sunRadius = 0.05;
      float sunIntensity = smoothstep(1.0 - sunRadius, 1.0, sunDot);
      skyColor = mix(skyColor, uSunColor, sunIntensity);
      
      // Sun glow/halo
      float glowIntensity = pow(max(0.0, sunDot), 4.0) * 0.5;
      skyColor += uSunColor * glowIntensity;
      
      // Atmospheric scattering near sun
      float scatter = pow(max(0.0, sunDot), 2.0) * 0.2;
      skyColor = mix(skyColor, uSunColor * 0.8 + vec3(0.1, 0.05, 0.0), scatter);
      
      // Clouds - only above horizon
      if (height > 0.02) {
        // Project onto a dome for cloud UVs
        vec2 cloudUv = direction.xz / (direction.y + 0.3);
        
        // Animate clouds slowly
        cloudUv += vec2(uTime * 0.003, uTime * 0.001);
        
        // Multiple cloud layers
        float cloudLayer1 = fbm(cloudUv * 0.4, 5);
        float cloudLayer2 = fbm(cloudUv * 0.8 + vec2(50.0, 30.0), 4);
        
        // Cloud density with sharp edges
        float cloudDensity1 = smoothstep(0.45, 0.65, cloudLayer1);
        float cloudDensity2 = smoothstep(0.5, 0.7, cloudLayer2) * 0.6;
        
        float totalCloud = max(cloudDensity1, cloudDensity2);
        
        // Cloud color - white with slight blue tint in shadows
        vec3 cloudColorLight = vec3(0.98, 0.98, 1.0);
        vec3 cloudColorShadow = vec3(0.85, 0.88, 0.95);
        
        // Cloud self-shadowing based on noise
        float cloudShading = fbm(cloudUv * 1.5 + vec2(100.0), 3);
        vec3 cloudColor = mix(cloudColorShadow, cloudColorLight, cloudShading);
        
        // Sun illumination on clouds
        float sunIllum = max(0.6, dot(vec3(0.0, 1.0, 0.0), uSunPosition));
        cloudColor *= sunIllum;
        
        // Golden tint near sun
        float cloudSunDot = dot(normalize(vec3(direction.x, 0.0, direction.z)), 
                                normalize(vec3(uSunPosition.x, 0.0, uSunPosition.z)));
        cloudColor += vec3(0.15, 0.1, 0.0) * max(0.0, cloudSunDot) * totalCloud;
        
        // Fade clouds near horizon for depth
        float horizonFade = smoothstep(0.02, 0.25, height);
        totalCloud *= horizonFade;
        
        // Apply clouds
        skyColor = mix(skyColor, cloudColor, totalCloud * 0.9);
      }
      
      // Horizon haze
      float horizonHaze = 1.0 - abs(height);
      horizonHaze = pow(horizonHaze, 12.0) * 0.4;
      skyColor = mix(skyColor, uSkyHorizon * 1.05, horizonHaze);
      
      gl_FragColor = vec4(skyColor, 1.0);
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
