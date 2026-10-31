/* oxlint-disable react/immutability -- R3F frame callbacks intentionally mutate Three.js state and typed buffers. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_VERTEX = `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = color;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.78 + 0.22 * sin(uTime * 1.05 + aPhase);
    gl_PointSize = aSize * twinkle;
    gl_Position = projectionMatrix * viewPosition;
    vAlpha = clamp(1.0 - (-viewPosition.z / 175.0), 0.22, 0.94);
  }
`

const STAR_FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float radius = length(point);
    if (radius > 0.5) discard;
    float glow = 1.0 - smoothstep(0.02, 0.5, radius);
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`

const NEBULA_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NEBULA_FRAGMENT = `
  varying vec2 vUv;
  uniform float uTime;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
  }
  void main() {
    vec2 p = vUv * vec2(5.2, 3.4);
    p += vec2(uTime * 0.008, -uTime * 0.004);
    float n = noise(p) * 0.58 + noise(p * 2.1 + 4.7) * 0.29 + noise(p * 4.4 - 2.3) * 0.13;
    float cloud = smoothstep(0.42, 0.78, n);
    float veil = smoothstep(0.18, 0.76, n) * 0.18;
    vec3 purple = vec3(0.25, 0.12, 0.53);
    vec3 blue = vec3(0.045, 0.25, 0.56);
    vec3 amber = vec3(0.48, 0.18, 0.075);
    float warmth = smoothstep(0.54, 0.86, noise(p * 0.72 + vec2(8.0, 1.0)));
    vec3 color = mix(blue, purple, smoothstep(0.25, 0.8, noise(p + 3.1)));
    color = mix(color, amber, warmth * 0.52);
    gl_FragColor = vec4(color, cloud * 0.23 + veil * 0.25);
  }
`

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function makeStars(count, depthNear, depthFar, sizeMin, sizeMax, seed) {
  const random = seededRandom(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const palettes = [new THREE.Color('#f4f8ff'), new THREE.Color('#bcd9ff'), new THREE.Color('#ffe3c2')]
  for (let i = 0; i < count; i += 1) {
    const z = -(depthNear + random() * (depthFar - depthNear))
    const spread = Math.abs(z) * 0.74
    positions[i * 3] = (random() * 2 - 1) * spread * 1.8
    positions[i * 3 + 1] = (random() * 2 - 1) * spread
    positions[i * 3 + 2] = z
    const color = palettes[Math.floor(random() * palettes.length)]
    colors.set([color.r, color.g, color.b], i * 3)
    sizes[i] = sizeMin + random() * (sizeMax - sizeMin)
    phases[i] = random() * Math.PI * 2
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  return geometry
}

function StarLayer({ count, near, far, sizes, seed, rotationSpeed }) {
  const points = useRef()
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  }), [])
  const geometry = useMemo(() => makeStars(count, near, far, sizes[0], sizes[1], seed), [count, near, far, sizes, seed])
  useFrame(({ clock }, delta) => {
    material.uniforms.uTime.value = clock.elapsedTime
    if (points.current) points.current.rotation.y += delta * rotationSpeed
  })
  useEffect(() => () => { material.dispose(); geometry.dispose() }, [material, geometry])
  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}

function Nebula() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: NEBULA_VERTEX,
    fragmentShader: NEBULA_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [])
  useFrame(({ clock }) => { material.uniforms.uTime.value = clock.elapsedTime })
  useEffect(() => () => material.dispose(), [material])
  return <mesh position={[0, 0, -60]}>
    <planeGeometry args={[220, 132]} />
    <primitive object={material} attach="material" />
  </mesh>
}

function Dust() {
  const ref = useRef()
  const geometry = useMemo(() => {
    const random = seededRandom(6421)
    const positions = new Float32Array(320 * 3)
    for (let i = 0; i < 320; i += 1) {
      positions[i * 3] = (random() - 0.5) * 34
      positions[i * 3 + 1] = (random() - 0.5) * 20
      positions[i * 3 + 2] = -2 - random() * 23
    }
    const dustGeometry = new THREE.BufferGeometry()
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return dustGeometry
  }, [])
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#b6d9ff', size: 0.045, transparent: true, opacity: 0.28, depthWrite: false }), [])
  useFrame((_, delta) => {
    const positions = geometry.attributes.position.array
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += delta * 0.46
      if (positions[i] > 1) positions[i] = -25
    }
    geometry.attributes.position.needsUpdate = true
    if (ref.current) ref.current.rotation.y += delta * 0.0015
  })
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}

function ShootingStar() {
  const group = useRef()
  const streakMaterial = useRef()
  const headMaterial = useRef()
  const flight = useRef({ active: false, start: 0, x: 0, y: 0, next: 9.5 })
  useFrame(({ clock }, delta) => {
    const current = flight.current
    const now = clock.elapsedTime
    if (!current.active && now >= current.next) {
      current.active = true
      current.start = now
      current.x = (Math.random() - 0.5) * 35
      current.y = (Math.random() - 0.5) * 18
    }
    if (current.active && group.current) {
      const progress = (now - current.start) / 0.78
      if (progress >= 1) {
        current.active = false
        current.next = now + 8 + Math.random() * 7
      } else {
        group.current.visible = true
        group.current.position.set(current.x - progress * 30, current.y - progress * 17, -5 - progress * 8)
        const opacity = 1 - progress
        if (streakMaterial.current) streakMaterial.current.opacity = opacity * 0.8
        if (headMaterial.current) headMaterial.current.opacity = opacity
      }
    } else if (group.current) {
      group.current.visible = false
    }
    if (group.current) group.current.rotation.z = -0.52 + delta * 0.01
  })
  return <group ref={group} visible={false}>
    <mesh position={[-0.95, 0, 0]}>
      <boxGeometry args={[2.1, 0.018, 0.012]} />
      <meshBasicMaterial ref={streakMaterial} color="#bfeaff" transparent opacity={0.8} depthWrite={false} />
    </mesh>
    <mesh position={[0.15, 0, 0]}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial ref={headMaterial} color="#ffffff" transparent opacity={1} />
    </mesh>
  </group>
}

function CameraMotion({ pointerRef, scrollRef }) {
  const { camera } = useThree()
  useFrame((_, delta) => {
    const pointer = pointerRef.current
    const scrollDepth = scrollRef.current * 8
    const damping = 1 - Math.exp(-delta * 1.1)
    camera.position.x += (pointer.x * 0.42 - camera.position.x) * damping
    camera.position.y += (pointer.y * 0.28 - camera.position.y) * damping
    camera.position.z += (scrollDepth - camera.position.z) * damping
    camera.rotation.y += (pointer.x * 0.009 - camera.rotation.y) * damping
    camera.rotation.x += (-pointer.y * 0.006 - camera.rotation.x) * damping
  })
  return null
}

function SpaceScene({ pointerRef, scrollRef, onFailure }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.setClearColor('#030711', 1)
    const handleContextLost = (event) => {
      event.preventDefault()
      onFailure?.()
    }
    gl.domElement.addEventListener('webglcontextlost', handleContextLost)
    return () => gl.domElement.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl, onFailure])
  return <>
    <Nebula />
    <StarLayer count={1900} near={9} far={105} sizes={[0.65, 1.55]} seed={23} rotationSpeed={0.0009} />
    <StarLayer count={1250} near={6} far={72} sizes={[0.8, 2.05]} seed={517} rotationSpeed={0.0017} />
    <StarLayer count={760} near={4.5} far={42} sizes={[1, 2.5]} seed={911} rotationSpeed={0.0026} />
    <Dust />
    <ShootingStar />
    <CameraMotion pointerRef={pointerRef} scrollRef={scrollRef} />
  </>
}

export default function GlobalSpaceScene({ onFailure }) {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const pointerRef = useRef({ x: 0, y: 0 })
  const scrollRef = useRef(0)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    const updateScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      scrollRef.current = Math.min(1, window.scrollY / maxScroll)
    }
    const onPointer = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * -2
    }
    const onOrientation = (event) => {
      if (typeof event.gamma === 'number' && typeof event.beta === 'number') {
        pointerRef.current.x = THREE.MathUtils.clamp(event.gamma / 35, -1, 1)
        pointerRef.current.y = THREE.MathUtils.clamp((event.beta - 35) / 45, -1, 1)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onOrientation, { passive: true })
    updateScroll()
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [])

  return <Canvas
    dpr={[1, 1.5]}
    frameloop={visible ? 'always' : 'never'}
    camera={{ position: [0, 0, 0], fov: 52, near: 0.1, far: 220 }}
    gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
  >
    <SpaceScene pointerRef={pointerRef} scrollRef={scrollRef} onFailure={onFailure} />
  </Canvas>
}
