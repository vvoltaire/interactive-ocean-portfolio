'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface SeaWaterProps {
  position?: [number, number, number]
}

export function SeaWater({ position = [0, 0, 0] }: SeaWaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uSunDirection: { value: new THREE.Vector3(0.3, 0.5, -0.4).normalize() },
      // Ocean colors matching reference images
      uDeepColor: { value: new THREE.Color('#0a2a3d') },
      uShallowColor: { value: new THREE.Color('#1a5a7a') },
      uFresnelColor: { value: new THREE.Color('#6aaed6') },
      uSkyColorTop: { value: new THREE.Color('#4a8dc9') },
      uSkyColorHorizon: { value: new THREE.Color('#b8d4e8') },
    }),
    []
  )

  const vertexShader = `
    uniform float uTime;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    // Improved noise functions for realistic waves
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // Gerstner wave for more realistic ocean waves
    vec3 gerstnerWave(vec2 position, float steepness, float wavelength, vec2 direction, float time) {
      float k = 2.0 * 3.14159 / wavelength;
      float c = sqrt(9.8 / k);
      vec2 d = normalize(direction);
      float f = k * (dot(d, position) - c * time);
      float a = steepness / k;
      
      return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
      );
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // World position for wave calculation
      vec2 worldXZ = (modelMatrix * vec4(position, 1.0)).xz;
      
      // Multiple Gerstner waves for realistic ocean
      vec3 wave = vec3(0.0);
      
      // Large swells
      wave += gerstnerWave(worldXZ, 0.15, 30.0, vec2(1.0, 0.5), uTime * 0.4);
      wave += gerstnerWave(worldXZ, 0.12, 20.0, vec2(0.7, 1.0), uTime * 0.5);
      wave += gerstnerWave(worldXZ, 0.1, 15.0, vec2(-0.5, 0.8), uTime * 0.6);
      
      // Medium waves
      wave += gerstnerWave(worldXZ, 0.08, 8.0, vec2(1.0, 0.3), uTime * 0.8);
      wave += gerstnerWave(worldXZ, 0.06, 6.0, vec2(-0.3, 1.0), uTime * 0.9);
      wave += gerstnerWave(worldXZ, 0.05, 4.0, vec2(0.8, -0.6), uTime * 1.0);
      
      // Small ripples using noise
      float ripple1 = snoise(vec3(worldXZ * 0.5, uTime * 0.3)) * 0.08;
      float ripple2 = snoise(vec3(worldXZ * 1.0, uTime * 0.5)) * 0.04;
      float ripple3 = snoise(vec3(worldXZ * 2.0, uTime * 0.7)) * 0.02;
      
      wave.y += ripple1 + ripple2 + ripple3;
      
      pos += wave;
      vHeight = wave.y;
      
      // Calculate normal from wave gradient
      float eps = 0.1;
      vec3 waveRight = gerstnerWave(worldXZ + vec2(eps, 0.0), 0.15, 30.0, vec2(1.0, 0.5), uTime * 0.4);
      vec3 waveLeft = gerstnerWave(worldXZ - vec2(eps, 0.0), 0.15, 30.0, vec2(1.0, 0.5), uTime * 0.4);
      vec3 waveForward = gerstnerWave(worldXZ + vec2(0.0, eps), 0.15, 30.0, vec2(1.0, 0.5), uTime * 0.4);
      vec3 waveBack = gerstnerWave(worldXZ - vec2(0.0, eps), 0.15, 30.0, vec2(1.0, 0.5), uTime * 0.4);
      
      vec3 tangent = normalize(vec3(2.0 * eps, waveRight.y - waveLeft.y, 0.0));
      vec3 bitangent = normalize(vec3(0.0, waveForward.y - waveBack.y, 2.0 * eps));
      vNormal = normalize(cross(bitangent, tangent));
      
      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uCameraPosition;
    uniform vec3 uSunDirection;
    uniform vec3 uDeepColor;
    uniform vec3 uShallowColor;
    uniform vec3 uFresnelColor;
    uniform vec3 uSkyColorTop;
    uniform vec3 uSkyColorHorizon;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
      
      // Fresnel effect - more sky reflection at grazing angles
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
      fresnel = clamp(fresnel, 0.05, 0.98);
      
      // Sky reflection based on reflected view direction
      vec3 reflectDir = reflect(-viewDir, normal);
      float skyGradient = reflectDir.y * 0.5 + 0.5;
      skyGradient = clamp(skyGradient, 0.0, 1.0);
      vec3 skyReflection = mix(uSkyColorHorizon, uSkyColorTop, pow(skyGradient, 0.6));
      
      // Add cloud-like variation to reflection
      float cloudPattern = sin(reflectDir.x * 3.0 + uTime * 0.1) * sin(reflectDir.z * 2.0 + uTime * 0.05);
      cloudPattern = cloudPattern * 0.5 + 0.5;
      skyReflection = mix(skyReflection, vec3(0.95, 0.97, 1.0), cloudPattern * 0.15 * skyGradient);
      
      // Water color based on view angle and wave height
      float depthFactor = 1.0 - fresnel;
      vec3 waterColor = mix(uShallowColor, uDeepColor, depthFactor);
      
      // Lighter color at wave crests
      float crestHighlight = smoothstep(0.0, 0.2, vHeight);
      waterColor = mix(waterColor, uShallowColor * 1.3, crestHighlight * 0.3);
      
      // Combine water and sky reflection with fresnel
      vec3 finalColor = mix(waterColor, skyReflection, fresnel);
      
      // Specular sun highlight
      vec3 halfVec = normalize(uSunDirection + viewDir);
      float specular = pow(max(dot(normal, halfVec), 0.0), 256.0);
      finalColor += vec3(1.0, 0.98, 0.9) * specular * 2.0;
      
      // Broader sun glitter
      float glitter = pow(max(dot(normal, halfVec), 0.0), 32.0);
      finalColor += vec3(1.0, 0.95, 0.85) * glitter * 0.4;
      
      // Subsurface scattering at wave peaks (greenish tint)
      float sss = max(0.0, vHeight) * fresnel;
      finalColor += vec3(0.1, 0.3, 0.25) * sss * 0.5;
      
      // Distance fog - blend to horizon color
      float dist = length(vWorldPosition.xz - uCameraPosition.xz);
      float fogFactor = 1.0 - exp(-dist * 0.003);
      fogFactor = clamp(fogFactor, 0.0, 0.85);
      finalColor = mix(finalColor, uSkyColorHorizon, fogFactor);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  useFrame((state) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uCameraPosition.value.copy(camera.position)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], position[1], position[2]]}
      receiveShadow
    >
      <planeGeometry args={[1000, 1000, 512, 512]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}
