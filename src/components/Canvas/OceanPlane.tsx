import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  PlaneGeometry,
  ShaderMaterial,
  Color,
} from 'three'
import { WATER_CONFIG } from '../../config/constants'

const oceanVertexShader = `
  uniform float uTime;
  uniform float uWaveAmplitude;
  uniform float uWaveFrequency;
  uniform float uWaveSpeed;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 pos = position;
    
    // Wave animation using sine waves
    float wave1 = sin(pos.x * uWaveFrequency * 0.1 + uTime * uWaveSpeed) * uWaveAmplitude;
    float wave2 = sin(pos.z * uWaveFrequency * 0.08 + uTime * uWaveSpeed * 0.8) * uWaveAmplitude;
    float wave3 = sin((pos.x + pos.z) * uWaveFrequency * 0.06 + uTime * uWaveSpeed * 0.6) * uWaveAmplitude * 0.5;
    
    pos.y += wave1 + wave2 + wave3;
    
    // Recalculate normal (simplified)
    vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
    vec3 bitangent = normalize(vec3(0.0, 0.0, 1.0));
    
    vec3 normal = normalize(cross(tangent, bitangent));
    
    vNormal = normalize(normalMatrix * normal);
    vPosition = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const oceanFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Basic lighting calculation
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    
    // Color based on height and lighting
    vec3 baseColor = mix(uEmissive, uColor, diff * 0.5 + 0.5);
    
    // Add subtle fresnel effect
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.0);
    baseColor = mix(baseColor, vec3(0.5, 0.8, 1.0), fresnel * 0.2);
    
    gl_FragColor = vec4(baseColor, 1.0);
  }
`

export default function OceanPlane() {
  const meshRef = useRef<THREE.Mesh>(null)

  // Create custom shader material
  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWaveAmplitude: { value: WATER_CONFIG.waveAmplitude },
        uWaveFrequency: { value: WATER_CONFIG.waveFrequency },
        uWaveSpeed: { value: WATER_CONFIG.waveSpeed },
        uColor: { value: new Color(WATER_CONFIG.color) },
        uEmissive: { value: new Color(WATER_CONFIG.emissive) },
      },
      side: 2, // THREE.DoubleSide
      wireframe: false,
    })
  }, [])

  // Create geometry
  const geometry = useMemo(() => {
    return new PlaneGeometry(
      WATER_CONFIG.planeWidth,
      WATER_CONFIG.planeHeight,
      WATER_CONFIG.widthSegments,
      WATER_CONFIG.heightSegments
    )
  }, [])

  // Update shader uniforms on each frame
  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material instanceof ShaderMaterial) {
      ;(meshRef.current.material as ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    />
  )
}
