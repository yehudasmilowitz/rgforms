'use client'

import { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  const count = 2500

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 5
    }
    return pos
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.getElapsedTime() * 0.03
    ref.current.rotation.y = clock.getElapsedTime() * 0.05
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#7c74ff"
        size={0.006}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

function WireframeIcosahedron() {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.15
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.25
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.2
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.1
      innerRef.current.rotation.y = -t * 0.15
    }
  })

  return (
    <group ref={groupRef} position={[2.2, 0.2, -1.5]}>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color="#7c74ff"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.006, 16, 80]} />
        <meshStandardMaterial color="#7c74ff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.006, 16, 80]} />
        <meshStandardMaterial color="#a59fff" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function HeroScene() {
  const [webgl, setWebgl] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setWebgl(hasWebGL())
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  if (!webgl || reduced) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 70% 50%, oklch(0.65 0.22 285 / 0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 80%, oklch(0.57 0.20 285 / 0.10) 0%, transparent 50%)
          `,
        }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 3, 3]} color="#7c74ff" intensity={2} />
          <pointLight position={[-3, -2, 2]} color="#a59fff" intensity={1} />
          <ParticleField />
          <WireframeIcosahedron />
        </Suspense>
      </Canvas>
    </div>
  )
}
