import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const DATA = [
  ['Sun', 0, .95, 7.25, 25],
  ['Mercury', 2.5, .11, 0, .241, 58.6], ['Venus', 3.35, .17, 177.4, .615, -243],
  ['Earth', 4.25, .18, 23.44, 1, .997], ['Mars', 5.2, .145, 25.19, 1.881, 1.026],
  ['Jupiter', 6.8, .42, 3.13, 11.86, .413], ['Saturn', 8.6, .36, 26.73, 29.46, .445],
  ['Uranus', 10.5, .29, 97.77, 84.01, -.718], ['Neptune', 12.5, .28, 28.32, 164.8, .671],
]
const PATHS = {
  Sun: '2k_sun.jpg', Mercury: '2k_mercury.jpg', Venus: '2k_venus_surface.jpg',
  Earth: '2k_earth_daymap.jpg', EarthNight: '2k_earth_nightmap.jpg', EarthClouds: '2k_earth_clouds.jpg',
  Moon: '2k_moon.jpg', Mars: '2k_mars.jpg', Jupiter: '2k_jupiter.jpg', Saturn: '2k_saturn.jpg',
  SaturnRing: '2k_saturn_ring_alpha.png', Uranus: '2k_uranus.jpg', Neptune: '2k_neptune.jpg',
  VenusAtmosphere: '2k_venus_atmosphere.jpg',
}
const texturePath = (file, low) => `/textures/${low ? file.replace(/^2k_/, '1k_') : file}`

function useTextures(low) {
  const [state, setState] = useState({ textures: {}, loaded: 0, total: Object.keys(PATHS).length, error: false, coreLoaded: false, complete: false })
  useEffect(() => {
    let active = true
    const manager = new THREE.LoadingManager()
    const loader = new THREE.TextureLoader(manager)
    const textures = {}
    manager.onProgress = () => active && setState(s => ({ ...s, loaded: Math.min(Object.keys(PATHS).length, s.loaded + 1), total: Object.keys(PATHS).length }))
    manager.onError = () => active && setState(s => ({ ...s, error: true }))
    const entries = Object.entries(PATHS)
    const coreKeys = new Set(['Sun','Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune'])
    const load = ([key, file]) => new Promise(resolve => {
      loader.load(texturePath(file, low), texture => {
        if (!active) { texture.dispose(); resolve(); return }
        texture.colorSpace = THREE.SRGBColorSpace
        textures[key] = texture
        setState(s => ({ ...s, textures: { ...s.textures, [key]: texture } }))
        resolve()
      }, undefined, () => { if (active) setState(s => ({ ...s, error: true })); resolve() })
    })
    Promise.all(entries.filter(([key]) => coreKeys.has(key)).map(load)).then(async () => {
      if (!active) return
      setState(s => ({ ...s, coreLoaded: true }))
      await Promise.all(entries.filter(([key]) => !coreKeys.has(key)).map(load))
      if (active) setState(s => ({ ...s, complete: true, loaded: s.total }))
    })
    return () => { active = false; Object.values(textures).forEach(texture => texture.dispose()) }
  }, [low])
  return state
}

function Label({ children, position }) {
  return <group position={position}><HtmlLabel text={children} /></group>
}
function HtmlLabel({ text }) {
  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96
    const ctx = canvas.getContext('2d'); ctx.font = 'bold 36px Arial'; ctx.fillStyle = '#d9efff'; ctx.textAlign = 'center'; ctx.fillText(text, 256, 62)
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture
  }, [text])
  useEffect(() => () => sprite.dispose(), [sprite])
  return <sprite scale={[1.2, .23, 1]} position={[0, .3, 0]}><spriteMaterial map={sprite} transparent depthWrite={false} /></sprite>
}

function Orbit({ radius }) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 181 }, (_, i) => new THREE.Vector3(Math.cos(i / 180 * Math.PI * 2) * radius, 0, Math.sin(i / 180 * Math.PI * 2) * radius))
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <lineLoop geometry={geometry}><lineBasicMaterial color="#3caed5" transparent opacity={.22} /></lineLoop>
}

function Atmosphere({ scale = 1.08, color = '#51baff' }) {
  return <mesh scale={scale}><sphereGeometry args={[1, 40, 40]} /><meshBasicMaterial color={color} transparent opacity={.13} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
}

function NightLights({ texture }) {
  const mesh = useRef(); const material = useRef(); const worldPosition = useMemo(() => new THREE.Vector3(), []); const worldDirection = useMemo(() => new THREE.Vector3(), []); const inverseRotation = useMemo(() => new THREE.Quaternion(), [])
  useFrame(() => {
    if (!texture || !mesh.current || !material.current) return
    mesh.current.getWorldPosition(worldPosition); worldDirection.set(-worldPosition.x, -worldPosition.y, -worldPosition.z).normalize()
    mesh.current.getWorldQuaternion(inverseRotation).invert()
    material.current.uniforms.sunLocal.value.copy(worldDirection.applyQuaternion(inverseRotation))
  })
  if (!texture) return null
  return <mesh ref={mesh} scale={1.004}>
    <sphereGeometry args={[1, 48, 48]} />
    <shaderMaterial ref={material} transparent depthWrite={false} uniforms={{ nightMap: { value: texture }, sunLocal: { value: new THREE.Vector3(-1, 0, 0) } }} vertexShader={`varying vec2 vUv; varying vec3 vNormal; void main(){vUv=uv; vNormal=normalize(normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`} fragmentShader={`uniform sampler2D nightMap; uniform vec3 sunLocal; varying vec2 vUv; varying vec3 vNormal; void main(){float dark=1.0-smoothstep(-0.3,0.25,dot(normalize(vNormal),normalize(sunLocal))); vec3 lights=texture2D(nightMap,vUv).rgb; float alpha=dark*max(max(lights.r,lights.g),lights.b)*0.9; gl_FragColor=vec4(lights,alpha);}`} />
  </mesh>
}

function Corona() {
  const glow = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128
    const context = canvas.getContext('2d'); const gradient = context.createRadialGradient(64, 64, 7, 64, 64, 62)
    gradient.addColorStop(0, 'rgba(255,240,190,0.9)'); gradient.addColorStop(.22, 'rgba(255,174,67,0.5)'); gradient.addColorStop(1, 'rgba(255,110,32,0)')
    context.fillStyle = gradient; context.fillRect(0, 0, 128, 128)
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; return map
  }, [])
  useEffect(() => () => glow.dispose(), [glow])
  return <sprite scale={[3.8, 3.8, 1]}><spriteMaterial map={glow} color="#ffb14e" transparent opacity={.48} blending={THREE.AdditiveBlending} depthWrite={false} /></sprite>
}

function AsteroidBelt() {
  const mesh = useRef()
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9a8d79', roughness: 1 }), [])
  const count = 1100
  useEffect(() => {
    if (!mesh.current) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2; const radius = 5.9 + Math.random() * .42
      dummy.position.set(Math.cos(angle) * radius, (Math.random() - .5) * .16, Math.sin(angle) * radius)
      const size = .009 + Math.random() * .022; dummy.scale.setScalar(size); dummy.rotation.set(Math.random(), Math.random(), Math.random()); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  }, [])
  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])
  return <instancedMesh ref={mesh} args={[geometry, material, count]} />
}

function World({ planet, texture, moonTexture, moon, night, clouds, ring, venusAtmosphere, onSelect, onSelectMoon, planetRefs, low, realScale, playing, speed, language }) {
  const [, radius, easySize, tilt, period, rotationPeriod] = DATA.find(item => item[0] === planet.name) || []
  const isMoon = planet.name === 'Moon'
  const orbit = useRef()
  const globe = useRef()
  const moonOrbit = useRef()
  const cloudLayer = useRef()
  const scale = isMoon ? .055 : realScale && planet.name !== 'Sun' ? planet.diameter_km / 12756 * .18 : easySize
  const orbitalRadius = isMoon ? .46 : radius
  const select = e => { e.stopPropagation(); onSelect(planet) }
  useFrame((_, delta) => {
    if (playing && orbit.current) orbit.current.rotation.y += delta * (isMoon ? .9 : .12 / period) * speed
    if (playing && globe.current) globe.current.rotation.y += delta * (planet.name === 'Sun' ? .006 : .04 / Math.abs(rotationPeriod || 25)) * speed * Math.sign(rotationPeriod || 1)
    if (playing && moonOrbit.current && planet.name === 'Earth') moonOrbit.current.rotation.y += delta * .42 * speed
    if (playing && cloudLayer.current && planet.name === 'Earth') cloudLayer.current.rotation.y += delta * .008 * speed
  })
  return <>
    {!isMoon && planet.name !== 'Sun' && <Orbit radius={orbitalRadius} />}
    <group ref={orbit}>
      <group position={isMoon ? [4.25, 0, 0] : [orbitalRadius, 0, 0]}>
        <group rotation={[THREE.MathUtils.degToRad(tilt || 0), 0, .06]} scale={scale}>
          <mesh ref={node => { globe.current = node; planetRefs.current[planet.name] = node }} onClick={select} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
            <sphereGeometry args={[1, low ? 32 : 48, low ? 32 : 48]} />
            <meshStandardMaterial map={texture} roughness={planet.name === 'Earth' ? .9 : 1} metalness={0} emissive={planet.name === 'Sun' ? '#ff7d22' : '#000000'} emissiveMap={planet.name === 'Sun' ? texture : null} emissiveIntensity={planet.name === 'Sun' ? 1.25 : 0} />
            {planet.name === 'Earth' && <NightLights texture={night} />}
            {planet.name === 'Earth' && clouds && <mesh ref={cloudLayer} scale={1.013}><sphereGeometry args={[1, 48, 48]} /><meshStandardMaterial alphaMap={clouds} color="#ffffff" transparent opacity={.32} depthWrite={false} roughness={1} /></mesh>}
            {planet.name === 'Earth' && <Atmosphere scale={1.05} />}
            {['Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(planet.name) && <Atmosphere scale={1.06} color={planet.name === 'Venus' ? '#f1cc9a' : '#77c9ed'} />}
            {planet.name === 'Venus' && venusAtmosphere && <mesh scale={1.018}><sphereGeometry args={[1, 40, 40]} /><meshStandardMaterial map={venusAtmosphere} transparent opacity={.2} depthWrite={false} roughness={1} /></mesh>}
          </mesh>
          {planet.name === 'Saturn' && <mesh rotation={[Math.PI / 2, .28, .14]}><ringGeometry args={[1.28, 2.25, 96]} /><meshStandardMaterial map={ring} color="#d8c6a1" side={THREE.DoubleSide} transparent opacity={.88} alphaMap={ring} roughness={1} /></mesh>}
          {planet.name === 'Sun' && <Corona />}
          <Label position={[0, 1.16, 0]}>{language === 'hi' ? (planet.name_hi || planet.name) : planet.name}</Label>
        </group>
        {planet.name === 'Earth' && <group ref={moonOrbit}>
          <group position={[.46, 0, 0]} scale={.055}>
            <mesh ref={node => { planetRefs.current.Moon = node }} onClick={e => { e.stopPropagation(); onSelectMoon(moon) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
              <sphereGeometry args={[1, low ? 24 : 32, low ? 24 : 32]} /><meshStandardMaterial map={moonTexture} roughness={1}/>
            </mesh><Label position={[0, 1.4, 0]}>{language === 'hi' ? 'चंद्रमा' : 'Moon'}</Label>
          </group>
        </group>}
        {!isMoon && <mesh onClick={select}><sphereGeometry args={[Math.max(.12, scale), 16, 16]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>}
      </group>
    </group>
  </>
}

function FollowCamera({ selected, refs, resetKey, zoom }) {
  const { camera } = useThree(); const look = useRef(new THREE.Vector3()); const point = useRef(new THREE.Vector3()); const destination = useRef(new THREE.Vector3())
  useFrame((_, delta) => {
    const target = selected && refs.current[selected.name]
    if (target) {
      target.getWorldPosition(point.current)
      const size = selected.name === 'Sun' ? 5 : selected.name === 'Jupiter' ? 2.2 : .95
      const distance = 1 / zoom
      destination.current.set(point.current.x + size * .4 * distance, point.current.y + size * .25 * distance, point.current.z + size * 2.7 * distance)
      camera.position.lerp(destination.current, 1 - Math.exp(-delta * 1.5))
    } else {
      point.current.set(0, 0, 0); const distance = 1 / zoom; destination.current.set(0, 14.5 * distance, 23.5 * distance); camera.position.lerp(destination.current, 1 - Math.exp(-delta * 1.3))
    }
    look.current.lerp(point.current, 1 - Math.exp(-delta * 1.7)); camera.lookAt(look.current)
  })
  useEffect(() => { void resetKey }, [resetKey])
  return null
}

function DesktopBloom() {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef(null)
  useEffect(() => {
    const effect = new EffectComposer(gl)
    effect.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), .42, .55, .8)
    effect.addPass(bloom)
    effect.addPass(new OutputPass())
    effect.setPixelRatio(Math.min(gl.getPixelRatio(), 1.5)); effect.setSize(size.width, size.height)
    composer.current = effect
    return () => { bloom.dispose(); effect.dispose(); composer.current = null }
  }, [gl, scene, camera, size.width, size.height])
  useFrame((_, delta) => composer.current?.render(delta), 1)
  return null
}

function System({ planets, selected, onSelect, textures, low, scaleMode, resetKey, playing, speed, zoom, language }) {
  const refs = useRef({})
  useEffect(() => () => { document.body.style.cursor = '' }, [])
  const starGeometry = useMemo(() => {
    const values = new Float32Array(2200 * 3)
    for (let i = 0; i < 2200; i++) { const r1 = (i * 16807 % 2147483647) / 2147483647; const r2 = (i * 48271 % 2147483647) / 2147483647; const r3 = (i * 69621 % 2147483647) / 2147483647; const radius = 22 + r1 * 32; const a = r2 * Math.PI * 2; const b = Math.acos(2 * r3 - 1); values.set([radius * Math.sin(b) * Math.cos(a), radius * Math.sin(b) * Math.sin(a), radius * Math.cos(b)], i * 3) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(values, 3)); return g
  }, [])
  useEffect(() => () => starGeometry.dispose(), [starGeometry])
  const sun = planets.find(item => item.name === 'Sun')
  const moon = { name: 'Moon', name_hi: 'चंद्रमा', display_color: '#d7d7d7', diameter_km: 3475, distance_from_sun_km: 149984400, orbital_period: { value: 27.3, unit: 'days' }, fun_fact_en: 'The Moon is moving slowly away from Earth.', fun_fact_hi: 'चंद्रमा धीरे-धीरे पृथ्वी से दूर जा रहा है।' }
  return <>
    <ambientLight intensity={.075} />
    <pointLight position={[0, 0, 0]} intensity={260} distance={120} decay={2} color="#fff0d6" />
    <points geometry={starGeometry}><pointsMaterial color="#d8eaff" size={.075} sizeAttenuation transparent opacity={.8} /></points>
    {planets.slice(1).map(planet => <World key={planet.name} planet={planet} texture={textures[planet.name]} moonTexture={textures.Moon} moon={moon} night={textures.EarthNight} clouds={textures.EarthClouds} ring={textures.SaturnRing} venusAtmosphere={textures.VenusAtmosphere} selected={selected} onSelect={onSelect} onSelectMoon={onSelect} planetRefs={refs} low={low} realScale={scaleMode === 'real'} playing={playing} speed={speed} language={language} />)}
    <World planet={sun} texture={textures.Sun} selected={selected} onSelect={onSelect} planetRefs={refs} low={low} realScale={false} playing={playing} speed={speed} language={language} />
    <AsteroidBelt />
    <FollowCamera selected={selected} refs={refs} resetKey={resetKey} zoom={zoom} />
  </>
}

export default function ExplorerScene({ planets, selected, onSelect, scaleMode, resetKey, low, playing, speed, zoom, onProgress, language }) {
  const state = useTextures(low)
  useEffect(() => onProgress?.(state), [state, onProgress])
  if (!state.coreLoaded) return null
  return <Canvas dpr={low ? 1 : [1, 1.5]} camera={{ position: [0, 14.5, 23.5], fov: 45, near: .1, far: 180 }} gl={{ antialias: !low, alpha: true }}>
    <System planets={planets} selected={selected} onSelect={onSelect} textures={state.textures} low={low} scaleMode={scaleMode} resetKey={resetKey} playing={playing} speed={speed} zoom={zoom} language={language} />
    {!low && <DesktopBloom />}
  </Canvas>
}
