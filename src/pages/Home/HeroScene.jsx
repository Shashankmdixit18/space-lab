import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Starfield ────────────────────────────────────────────────────────────────
function Starfield({ count = 1800 }) {
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [count])

  return (
    <points geometry={geo}>
      <pointsMaterial
        color="#e8f4fd"
        size={0.18}
        sizeAttenuation
        transparent
        opacity={0.75}
      />
    </points>
  )
}

// ─── Orbit Ring ───────────────────────────────────────────────────────────────
function OrbitRing() {
  const geo = useMemo(() => new THREE.TorusGeometry(3.2, 0.012, 8, 120), [])
  return (
    <mesh geometry={geo} rotation={[Math.PI / 2.5, 0.2, 0]}>
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.18} />
    </mesh>
  )
}

// ─── Atmosphere (additive glow shell) ────────────────────────────────────────
function Atmosphere({ radius = 2.05 }) {
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      gl_FragColor = vec4(0.0, 0.65, 1.0, 1.0) * intensity;
    }
  `
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      }),
    []
  )
  useEffect(() => () => mat.dispose(), [mat])
  return (
    <mesh scale={[1.12, 1.12, 1.12]}>
      <sphereGeometry args={[radius, 40, 40]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

// ─── Planet ───────────────────────────────────────────────────────────────────
function Planet({ mouseRef }) {
  const groupRef = useRef()
  const meshRef = useRef()

  // Procedural surface colour texture (canvas)
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    // Deep ocean base
    ctx.fillStyle = '#0a1e3d'
    ctx.fillRect(0, 0, size, size)

    // Land masses (random blobs)
    const rng = (n) => Math.sin(n * 127.1 + 311.7) * 0.5 + 0.5
    for (let i = 0; i < 18; i++) {
      const x = rng(i * 3) * size
      const y = rng(i * 3 + 1) * size
      const r = 12 + rng(i * 3 + 2) * 30
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, `rgba(22,80,60,0.9)`)
      grad.addColorStop(0.6, `rgba(18,60,45,0.6)`)
      grad.addColorStop(1, `rgba(10,30,30,0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Ice caps
    const topGrad = ctx.createLinearGradient(0, 0, 0, size * 0.18)
    topGrad.addColorStop(0, 'rgba(200,230,255,0.7)')
    topGrad.addColorStop(1, 'rgba(200,230,255,0)')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, size, size * 0.18)

    const botGrad = ctx.createLinearGradient(0, size * 0.82, 0, size)
    botGrad.addColorStop(0, 'rgba(200,230,255,0)')
    botGrad.addColorStop(1, 'rgba(200,230,255,0.6)')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, size * 0.82, size, size * 0.18)

    return new THREE.CanvasTexture(canvas)
  }, [])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Slow self-rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08
    }

    // Mouse parallax (subtle tilt)
    const mx = mouseRef.current.x * 0.18
    const my = mouseRef.current.y * 0.12
    groupRef.current.rotation.y += (mx - groupRef.current.rotation.y) * 0.04
    groupRef.current.rotation.x += (-my - groupRef.current.rotation.x) * 0.04
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.05} />
      </mesh>
      <Atmosphere radius={2} />
    </group>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ mouseRef }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-8, -2, -4]} intensity={0.3} color="#0044ff" />
      <Planet mouseRef={mouseRef} />
      <OrbitRing />
      <Starfield />
    </>
  )
}

// ─── Exported Canvas Wrapper ──────────────────────────────────────────────────
export default function HeroScene({ mouseRef }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 7], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Scene mouseRef={mouseRef} />
    </Canvas>
  )
}
