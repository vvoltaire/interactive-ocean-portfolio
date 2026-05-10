'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface SeaWaterProps {
  position?: [number, number, number]
}

export function SeaWater({ position = [0, 0, 0] }: SeaWaterProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera, gl, scene } = useThree()
  
  // Create reflection render target for planar reflections
  const reflectionRenderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(1024, 1024, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    })
  }, [])
  
  // Reflection camera
  const reflectionCamera = useMemo(() => {
    return new THREE.PerspectiveCamera()
  }, [])
  
  // Clip plane for reflection
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPosition: { value: new THREE.Vector3() },
      uSunDirection: { value: new THREE.Vector3(0.5, 0.6, -0.3).normalize() },
      uReflectionTexture: { value: reflectionRenderTarget.texture },
      uReflectionMatrix: { value: new THREE.Matrix4() },
      // Ocean colors - richer, more varied
      uDeepColor: { value: new THREE.Color('#0a3d5c') },
      uMidColor: { value: new THREE.Color('#1a6b8a') },
      uShallowColor: { value: new THREE.Color('#3498b8') },
      uFresnelColor: { value: new THREE.Color('#7ec8e8') },
      uSkyColorTop: { value: new THREE.Color('#5da4d4') },
      uSkyColorHorizon: { value: new THREE.Color('#c8e4f4') },
      uFoamColor: { value: new THREE.Color('#ffffff') },
      // Wave parameters
      uWaveStrength: { value: 1.0 },
      uChoppiness: { value: 1.2 },
    }),
    [reflectionRenderTarget.texture]
  )

  const vertexShader = `
    uniform float uTime;
    uniform float uWaveStrength;
    uniform float uChoppiness;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    varying vec4 vReflectionCoord;
    varying float vFoam;
    
    // Simplex noise for detailed ripples
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
    
    // Gerstner wave with full displacement
    vec3 gerstnerWave(vec2 pos, float steepness, float wavelength, vec2 direction, float time, out vec3 tangent, out vec3 binormal) {
      float k = 2.0 * 3.14159265 / wavelength;
      float c = sqrt(9.81 / k);
      vec2 d = normalize(direction);
      float f = k * (dot(d, pos) - c * time);
      float a = steepness / k;
      
      tangent = vec3(
        1.0 - d.x * d.x * steepness * sin(f),
        d.x * steepness * cos(f),
        -d.x * d.y * steepness * sin(f)
      );
      
      binormal = vec3(
        -d.x * d.y * steepness * sin(f),
        d.y * steepness * cos(f),
        1.0 - d.y * d.y * steepness * sin(f)
      );
      
      return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
      );
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec2 worldXZ = worldPos.xz;
      
      vec3 wave = vec3(0.0);
      vec3 tangent = vec3(1.0, 0.0, 0.0);
      vec3 binormal = vec3(0.0, 0.0, 1.0);
      vec3 t, b;
      
      float chop = uChoppiness;
      float strength = uWaveStrength;
      
      // Ocean swells - multiple overlapping Gerstner waves
      // Primary swell
      wave += gerstnerWave(worldXZ, 0.20 * chop, 45.0, vec2(1.0, 0.6), uTime * 0.35, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      // Secondary swell
      wave += gerstnerWave(worldXZ, 0.15 * chop, 32.0, vec2(0.8, 1.0), uTime * 0.42, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      // Cross swell
      wave += gerstnerWave(worldXZ, 0.12 * chop, 25.0, vec2(-0.4, 0.9), uTime * 0.48, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      // Medium waves
      wave += gerstnerWave(worldXZ, 0.08 * chop, 12.0, vec2(1.0, 0.2), uTime * 0.7, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      wave += gerstnerWave(worldXZ, 0.06 * chop, 8.0, vec2(-0.2, 1.0), uTime * 0.85, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      wave += gerstnerWave(worldXZ, 0.05 * chop, 6.0, vec2(0.7, -0.7), uTime * 0.95, t, b) * strength;
      tangent += t - vec3(1.0, 0.0, 0.0);
      binormal += b - vec3(0.0, 0.0, 1.0);
      
      // Small chop waves
      wave += gerstnerWave(worldXZ, 0.035 * chop, 3.5, vec2(1.0, 0.5), uTime * 1.3, t, b) * strength;
      wave += gerstnerWave(worldXZ, 0.025 * chop, 2.5, vec2(-0.5, 1.0), uTime * 1.5, t, b) * strength;
      wave += gerstnerWave(worldXZ, 0.02 * chop, 1.8, vec2(0.8, 0.6), uTime * 1.8, t, b) * strength;
      
      // Fine detail from noise
      float detail1 = snoise(vec3(worldXZ * 0.15, uTime * 0.25)) * 0.12 * strength;
      float detail2 = snoise(vec3(worldXZ * 0.35, uTime * 0.4)) * 0.06 * strength;
      float detail3 = snoise(vec3(worldXZ * 0.8, uTime * 0.6)) * 0.03 * strength;
      float detail4 = snoise(vec3(worldXZ * 1.5, uTime * 0.8)) * 0.015 * strength;
      
      wave.y += detail1 + detail2 + detail3 + detail4;
      
      pos += wave;
      vHeight = wave.y;
      
      // Calculate proper normal from tangent and binormal
      vNormal = normalize(cross(binormal, tangent));
      
      // Add normal detail from noise
      vec3 noiseNormal = vec3(
        snoise(vec3(worldXZ * 0.5, uTime * 0.3)),
        1.0,
        snoise(vec3(worldXZ * 0.5 + 100.0, uTime * 0.3))
      );
      vNormal = normalize(mix(vNormal, normalize(noiseNormal), 0.15));
      
      worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      
      // Foam at wave crests
      float steepness = length(tangent - vec3(1.0, 0.0, 0.0)) + length(binormal - vec3(0.0, 0.0, 1.0));
      vFoam = smoothstep(0.3, 0.8, vHeight * 2.0 + steepness * 0.3);
      vFoam *= smoothstep(0.0, 0.15, vHeight);
      
      // Reflection coordinates
      vReflectionCoord = projectionMatrix * viewMatrix * worldPos;
      
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uCameraPosition;
    uniform vec3 uSunDirection;
    uniform vec3 uDeepColor;
    uniform vec3 uMidColor;
    uniform vec3 uShallowColor;
    uniform vec3 uFresnelColor;
    uniform vec3 uSkyColorTop;
    uniform vec3 uSkyColorHorizon;
    uniform vec3 uFoamColor;
    uniform sampler2D uReflectionTexture;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying float vHeight;
    varying vec4 vReflectionCoord;
    varying float vFoam;
    
    // Fresnel schlick approximation
    float fresnel(vec3 viewDir, vec3 normal, float power) {
      return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
      
      // Fresnel effect with more realistic power
      float fresnelTerm = fresnel(viewDir, normal, 3.5);
      fresnelTerm = clamp(fresnelTerm, 0.02, 0.98);
      
      // Sky reflection based on reflected direction
      vec3 reflectDir = reflect(-viewDir, normal);
      float skyGradient = reflectDir.y * 0.5 + 0.5;
      skyGradient = clamp(skyGradient, 0.0, 1.0);
      vec3 skyReflection = mix(uSkyColorHorizon, uSkyColorTop, pow(skyGradient, 0.5));
      
      // Add variation to sky reflection
      float cloudVar = sin(reflectDir.x * 4.0 + uTime * 0.08) * cos(reflectDir.z * 3.0 + uTime * 0.06);
      cloudVar = cloudVar * 0.5 + 0.5;
      skyReflection = mix(skyReflection, vec3(0.95, 0.98, 1.0), cloudVar * 0.2 * skyGradient);
      
      // Planar reflection lookup with distortion
      vec2 reflectionUV = vReflectionCoord.xy / vReflectionCoord.w;
      reflectionUV = reflectionUV * 0.5 + 0.5;
      reflectionUV.y = 1.0 - reflectionUV.y;
      
      // Distort reflection based on normal
      vec2 distortion = normal.xz * 0.05;
      reflectionUV += distortion;
      
      vec4 planarReflection = texture2D(uReflectionTexture, clamp(reflectionUV, 0.0, 1.0));
      
      // Blend planar and sky reflections
      vec3 reflection = mix(skyReflection, planarReflection.rgb, planarReflection.a * 0.6);
      
      // Water color gradient based on depth/view angle
      float depthFactor = dot(viewDir, vec3(0.0, 1.0, 0.0));
      depthFactor = clamp(depthFactor, 0.0, 1.0);
      vec3 waterColor = mix(uDeepColor, uMidColor, depthFactor);
      waterColor = mix(waterColor, uShallowColor, pow(depthFactor, 2.0));
      
      // Lighter color at wave crests
      float crestHighlight = smoothstep(-0.1, 0.25, vHeight);
      waterColor = mix(waterColor, uShallowColor * 1.2, crestHighlight * 0.4);
      
      // Combine water and reflection
      vec3 finalColor = mix(waterColor, reflection, fresnelTerm);
      
      // Subsurface scattering effect
      float sss = pow(max(0.0, vHeight + 0.1), 2.0) * fresnelTerm;
      vec3 sssColor = vec3(0.1, 0.4, 0.35);
      finalColor += sssColor * sss * 0.3;
      
      // Sun specular highlight
      vec3 halfVec = normalize(uSunDirection + viewDir);
      float specular = pow(max(dot(normal, halfVec), 0.0), 512.0);
      finalColor += vec3(1.0, 0.98, 0.92) * specular * 3.0;
      
      // Sun glitter (broader specular)
      float glitter = pow(max(dot(normal, halfVec), 0.0), 64.0);
      finalColor += vec3(1.0, 0.96, 0.88) * glitter * 0.5;
      
      // Fine glitter from normal variation
      float microGlitter = pow(max(dot(normal, halfVec), 0.0), 16.0);
      finalColor += vec3(1.0, 0.98, 0.95) * microGlitter * 0.15;
      
      // Foam on wave crests
      finalColor = mix(finalColor, uFoamColor, vFoam * 0.4);
      
      // Distance fog to horizon
      float dist = length(vWorldPosition.xz - uCameraPosition.xz);
      float fogFactor = 1.0 - exp(-dist * 0.002);
      fogFactor = clamp(fogFactor, 0.0, 0.9);
      vec3 fogColor = mix(uSkyColorHorizon, uSkyColorTop * 0.9, 0.3);
      finalColor = mix(finalColor, fogColor, fogFactor);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  // Render reflection
  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return
    
    const time = state.clock.elapsedTime
    materialRef.current.uniforms.uTime.value = time
    materialRef.current.uniforms.uCameraPosition.value.copy(camera.position)
    
    // Render planar reflection
    const waterY = position[1]
    
    // Store original camera state
    const originalCameraPosition = camera.position.clone()
    const originalCameraQuaternion = camera.quaternion.clone()
    
    // Mirror camera for reflection
    reflectionCamera.copy(camera as THREE.PerspectiveCamera)
    reflectionCamera.position.y = -camera.position.y + 2 * waterY
    reflectionCamera.rotation.x = -camera.rotation.x
    reflectionCamera.updateMatrixWorld()
    reflectionCamera.updateProjectionMatrix()
    
    // Hide water mesh during reflection render
    meshRef.current.visible = false
    
    // Set up clipping
    gl.clippingPlanes = [clipPlane]
    
    // Render reflection
    const originalRenderTarget = gl.getRenderTarget()
    gl.setRenderTarget(reflectionRenderTarget)
    gl.clear()
    gl.render(scene, reflectionCamera)
    gl.setRenderTarget(originalRenderTarget)
    
    // Restore
    gl.clippingPlanes = []
    meshRef.current.visible = true
    camera.position.copy(originalCameraPosition)
    camera.quaternion.copy(originalCameraQuaternion)
  })

  // Cleanup
  useEffect(() => {
    return () => {
      reflectionRenderTarget.dispose()
    }
  }, [reflectionRenderTarget])

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], position[1], position[2]]}
      receiveShadow
    >
      <planeGeometry args={[1000, 1000, 256, 256]} />
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
