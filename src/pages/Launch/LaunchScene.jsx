import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const BODY_TEXTURES = { Moon: '2k_moon.jpg', Mars: '2k_mars.jpg', Sun: '2k_sun.jpg' }
const V = THREE.Vector3

function useSlowReplay(flight, outcome) {
  const [playing, setPlaying] = useState(false); const [frame, setFrame] = useState(flight)
  useEffect(() => {
    if (!playing) { setFrame(flight); return undefined }
    const history = outcome?.replayHistory || []
    if (!history.length) { setPlaying(false); return undefined }
    let index = history.length - 1
    setFrame(history[index])
    const timer = setInterval(() => { index -= 1; if (index < 0) { clearInterval(timer); setPlaying(false); return } setFrame(history[index]) }, 420)
    return () => clearInterval(timer)
  }, [playing, outcome, flight])
  return [playing, () => setPlaying(value => !value), frame]
}

function RocketModel({ flame, broken = false }) {
  return <group>
    <group position={[0, .42, 0]}><mesh><cylinderGeometry args={[.17, .21, .82, 12]} /><meshStandardMaterial color="#e8edf4" metalness={.65} roughness={.28} /></mesh><mesh position={[0, .49, 0]}><coneGeometry args={[.17, .3, 12]} /><meshStandardMaterial color="#f5f7fa" metalness={.4} roughness={.26} /></mesh><mesh position={[0, .05, 0]}><cylinderGeometry args={[.214, .22, .12, 12]} /><meshStandardMaterial color="#e87545" metalness={.45} /></mesh><mesh position={[0, -.14, 0]}><cylinderGeometry args={[.21, .25, .38, 12]} /><meshStandardMaterial color="#adb9c9" metalness={.55} roughness={.3} /></mesh><mesh position={[0, -.36, 0]}><cylinderGeometry args={[.255, .26, .08, 12]} /><meshStandardMaterial color="#f0f3f5" metalness={.5} /></mesh><mesh position={[0, -.6, 0]}><cylinderGeometry args={[.12, .16, .48, 10]} /><meshStandardMaterial color="#c7d0dc" metalness={.5} /></mesh>{[-1, 1].map(x => <mesh key={`f${x}`} position={[x * .18, -.25, 0]} rotation={[0, 0, -x * .28]}><boxGeometry args={[.16, .34, .045]} /><meshStandardMaterial color="#dd6744" metalness={.28} /></mesh>)}</group>
    {broken ? <mesh position={[.32, .2, .08]} rotation={[.4, 0, .8]}><boxGeometry args={[.28, .22, .2]} /><meshStandardMaterial color="#f07846" /></mesh> : null}
    <group position={[0, -.63, 0]}><mesh scale={[.13 + flame * .1, .22 + flame * .35, .13 + flame * .1]}><coneGeometry args={[1, 1, 10]} /><meshBasicMaterial color="#ffb332" transparent opacity={.86} blending={THREE.AdditiveBlending} /></mesh><mesh scale={[.07 + flame * .06, .18 + flame * .22, .07 + flame * .06]}><coneGeometry args={[1, 1, 10]} /><meshBasicMaterial color="#e9f7ff" transparent opacity={.9} blending={THREE.AdditiveBlending} /></mesh><pointLight color="#ff882d" intensity={flame * 3} distance={3} /></group>
  </group>
}

function Rocket({ flight, outcome, throttle, pitch, cameraMode, replay, onSeparate }) {
  const root = useRef(); const booster = useRef(); const { camera } = useThree()
  const particles = useRef(); const smokeGeometry = useMemo(() => new THREE.BufferGeometry(), []); const smokePositions = useMemo(() => new Float32Array(180 * 3), [])
  const smokeMaterial = useRef()
  const particleDummy = useMemo(() => new THREE.Object3D(), [])
  const debrisGeometry = useMemo(() => new THREE.TetrahedronGeometry(.075, 0), [])
  const debrisMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f08048', metalness: .4 }), [])
  const { invalidate } = useThree(); const invalidationTimer = useRef()
  useEffect(() => () => { smokeGeometry.dispose(); debrisGeometry.dispose(); debrisMaterial.dispose() }, [smokeGeometry, debrisGeometry, debrisMaterial])
  useEffect(() => () => clearTimeout(invalidationTimer.current), [])
  useEffect(() => { if (flight?.separated) onSeparate?.() }, [flight?.separated, onSeparate])
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const altitude = flight?.altitude || 0
    const lift = Math.min(17, altitude / Math.max(150, outcome?.altitude || 900) * 17)
    const failed = outcome && !outcome.success
    const burnup = failed && (outcome.reason === 'steep' || outcome.reason === 'shallow')
    const structural = failed && outcome.reason === 'maxq'
    const timeScale = failed && replay ? .25 : 1
    if (root.current) {
      const falling = failed && (burnup || outcome.reason === 'fuel' || structural) ? Math.max(0, t - (burnup ? 1 : 3)) * (burnup ? .34 : .12) : 0
      root.current.position.set(.35 * Math.sin(t * 7) * (altitude < 10 ? .08 : .015), lift - 1.45 - falling, 0)
      const targetTilt = burnup ? Math.sin(t * 8) * .7 : pitch * Math.PI / 180 - Math.PI / 2
      root.current.rotation.z += (targetTilt - root.current.rotation.z) * Math.min(1, delta * 2.2 * timeScale)
      if (structural && t % 1.4 < .25) root.current.scale.setScalar(.7 + Math.random() * .65)
      else root.current.scale.setScalar(1)
    }
    if (booster.current && flight?.separated) {
      const age = Math.max(0, (flight.elapsed || 0) - (flight.separatedAt ?? 28))
      booster.current.visible = true; booster.current.position.set(-.7 - age * .018, lift - 1.5 - age * age * .004, .18)
      booster.current.rotation.z = age * .12; booster.current.rotation.x = age * .16
    }
    if (particles.current) {
      for (let i = 0; i < 180; i++) {
        const angle = i * 2.399; const age = (t * (1.1 + (i % 7) * .04) + i * .31) % 1
        const spread = .08 + age * .65; const opacityScale = altitude < 3 ? 1 - altitude / 4 : Math.max(0, 1 - lift / 5)
        particleDummy.position.set(root.current?.position.x + Math.cos(angle) * spread, root.current?.position.y - .8 - age * 2.2, Math.sin(angle) * spread)
        particleDummy.scale.setScalar((i % 5 === 0 ? .13 : .055) * opacityScale * (1 - age * .4)); particleDummy.rotation.set(angle, t, age * 4); particleDummy.updateMatrix(); particles.current.setMatrixAt(i, particleDummy.matrix)
      }
      particles.current.instanceMatrix.needsUpdate = true
    }
    const p = smokeGeometry.attributes.position
    for (let i = 0; i < 180; i++) { const age = (t * .17 + i * .011) % 1; const a = i * 2.4; smokePositions[i * 3] = root.current?.position.x + Math.cos(a) * age * 2; smokePositions[i * 3 + 1] = -1.7 - age * 2.2; smokePositions[i * 3 + 2] = Math.sin(a) * age * 1.2 }
    if (!p) smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3)); else p.needsUpdate = true
    if (smokeMaterial.current) smokeMaterial.current.opacity = Math.max(0, .24 * (1 - lift / 4))
    if (root.current && flight?.elapsed > 0) {
      const chase = cameraMode !== 'side'
      const dest = chase ? new V(root.current.position.x + .4, root.current.position.y + 1.4, 5.5) : new V(root.current.position.x + 7.5, root.current.position.y + 1.6, 10)
      camera.position.lerp(dest, 1 - Math.exp(-delta * 1.7)); camera.lookAt(root.current.position.x, root.current.position.y + .2, 0)
    }
    if (altitude < 8 && flight?.countdown === 0) camera.position.x += Math.sin(t * 24) * .003
    clearTimeout(invalidationTimer.current); invalidationTimer.current = setTimeout(invalidate, 33)
  })
  return <>
    <mesh position={[0, -2.1, 0]}><cylinderGeometry args={[2.6, 3.4, .4, 32]} /><meshStandardMaterial color="#47525f" roughness={.95} /></mesh>
    <Gantry altitude={flight?.altitude || 0} />
    <group ref={root}><RocketModel flame={outcome?.reason === 'fuel' && stateTime(flight) > 5 ? .05 : throttle / 100} broken={Boolean(outcome && !outcome.success && outcome.reason === 'maxq')} /></group>
    <group ref={booster} visible={false}><mesh><cylinderGeometry args={[.2, .25, .68, 12]} /><meshStandardMaterial color="#b1bac8" metalness={.45} /></mesh><mesh position={[0, -.45, 0]}><coneGeometry args={[.12, .4, 10]} /><meshBasicMaterial color="#ff8e27" /></mesh></group>
    <instancedMesh ref={particles} args={[undefined, undefined, 180]}><sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial color="#ff8b25" transparent opacity={.48} blending={THREE.AdditiveBlending} depthWrite={false} /></instancedMesh>
    <points geometry={smokeGeometry}><pointsMaterial ref={smokeMaterial} color="#c7d2dd" size={.22} transparent opacity={.22} depthWrite={false} /></points>
    {flight?.separated && <mesh position={[-.5, 0, 0]} scale={.55}><sphereGeometry args={[1, 12, 10]} /><meshBasicMaterial color="#ffe2a1" transparent opacity={Math.max(0, .45 - Math.max(0, (flight.elapsed - (flight.separatedAt || 0)) * .1))} blending={THREE.AdditiveBlending} /></mesh>}
    {outcome?.reason === 'maxq' && <mesh position={[0, 3, 0]}><sphereGeometry args={[1.1, 12, 12]} /><meshBasicMaterial color="#ffe7a0" transparent opacity={.65} blending={THREE.AdditiveBlending} /></mesh>}
    {outcome && ['steep', 'shallow'].includes(outcome.reason) && <mesh position={[0, 1.2, 0]} scale={[.52, 1.7, .52]}><sphereGeometry args={[1, 12, 10]} /><meshBasicMaterial color="#ff682b" transparent opacity={.45} blending={THREE.AdditiveBlending} /></mesh>}
  </>
}

function Gantry({ altitude }) {
  const arm = useRef()
  useFrame((_, delta) => { if (arm.current) arm.current.rotation.z += ((altitude > 2 ? -.72 : 0) - arm.current.rotation.z) * Math.min(1, delta * .85) })
  return <group position={[0, -1.1, -1.1]}><mesh><boxGeometry args={[.25, 2.2, .25]} /><meshStandardMaterial color="#aab6c1" metalness={.55} /></mesh><group ref={arm} position={[0, .3, 0]}><mesh position={[.62, 0, 0]}><boxGeometry args={[1.3, .14, .25]} /><meshStandardMaterial color="#aab6c1" metalness={.55} /></mesh></group></group>
}

function stateTime(flight) { return flight?.elapsed || 0 }

function FailureDebris({ active }) {
  const mesh = useRef(); const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!mesh.current || !active) return
    const time = clock.elapsedTime
    for (let i = 0; i < 28; i++) { const angle = i * 2.4; const age = (time * .18 + i * .037) % 1; dummy.position.set(Math.cos(angle) * age * 2.8, 1.2 + Math.sin(angle) * age * 1.5 - age * age * 3, Math.sin(angle * 1.7) * age * 1.3); dummy.rotation.set(age * 8 + i, age * 5, angle); dummy.scale.setScalar(.35 + (i % 5) * .12); dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix) }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  if (!active) return null
  return <instancedMesh ref={mesh} args={[null, null, 28]}><tetrahedronGeometry args={[.12, 0]} /><meshStandardMaterial color="#ff8b4d" metalness={.5} /></instancedMesh>
}

function Earth({ altitude, texture, clouds }) {
  const visibility = THREE.MathUtils.smoothstep(altitude, 170, 400)
  return <group position={[0, -9.8, -13]}><mesh scale={4.4}><sphereGeometry args={[1, 48, 32]} /><meshStandardMaterial map={texture} roughness={.9} /></mesh><mesh scale={4.53}><sphereGeometry args={[1, 36, 24]} /><meshBasicMaterial color="#49baff" transparent opacity={.28 * visibility} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh><mesh scale={4.43}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial map={clouds} transparent opacity={.18} depthWrite={false} /></mesh></group>
}

function OrbitPath({ missionId, targetName, deployed, altitude, texture }) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 120 }, (_, i) => { const t = i / 119 * Math.PI * 2; return new V(Math.cos(t) * 5.2, -1.8 + Math.sin(t) * .6, -9 + Math.sin(t) * 4.7) })
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const transfer = useMemo(() => new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(new V(0, -1.4, 0), new V(2, 5, -9), new V(4.2, .4, -12)).getPoints(64)), [])
  useEffect(() => () => transfer.dispose(), [transfer])
  return <><line geometry={geometry}><lineBasicMaterial color="#58d8ff" transparent opacity={deployed ? .75 : .01} /></line>{missionId > 0 && <><line geometry={transfer}><lineBasicMaterial color="#78dfff" transparent opacity={THREE.MathUtils.smoothstep(altitude, 120, 400) * .52} /></line><mesh position={[4.2, .4, -12]}><sphereGeometry args={[.8, 24, 20]} /><meshStandardMaterial map={texture} emissive={targetName === 'Sun' ? '#dc762b' : '#000'} emissiveIntensity={targetName === 'Sun' ? .5 : 0} /></mesh></>}{deployed && <mesh position={[.25, -.8, 0]} rotation={[.2, .4, .3]}><boxGeometry args={[.3, .18, .3]} /><meshStandardMaterial color="#dce9f2" metalness={.5} /></mesh>}</>
}

function Scenery({ flight, outcome, missionId, targetName, rocket, throttle, pitch, cameraMode, replay, onSeparate, textures }) {
  const { scene, camera, invalidate } = useThree();
  useEffect(() => { scene.background = new THREE.Color('#72b7e8'); camera.position.set(0, 1.4, 8.5); camera.lookAt(0, 0, 0); invalidate() }, [scene, camera, invalidate])
  useFrame(({ clock }) => {
    const a = flight?.altitude || 0; const color = new THREE.Color('#77bce9').lerp(new THREE.Color('#06172e'), THREE.MathUtils.smoothstep(a, 0, 280)).lerp(new THREE.Color('#010309'), THREE.MathUtils.smoothstep(a, 280, 700))
    scene.background?.lerp?.(color, .06)
    if (cameraMode === 'side') camera.position.x += (8 - camera.position.x) * .025
    void clock
  })
  return <><ambientLight intensity={.65} /><directionalLight position={[5, 7, 4]} intensity={2.1} /><pointLight position={[0, 0, 1]} color="#ff772c" intensity={throttle / 20} distance={8} /><Earth altitude={flight?.altitude || 0} texture={textures.earth} clouds={textures.clouds} />
    <mesh position={[0, 0, -18]}><planeGeometry args={[90, 70]} /><meshBasicMaterial color="#01040b" transparent opacity={THREE.MathUtils.smoothstep(flight?.altitude || 0, 100, 450) * .9} /></mesh>
    {Array.from({ length: 180 }, (_, i) => <mesh key={i} position={[-22 + (i * 37 % 440) / 10, -4 + (i * 71 % 260) / 10, -20]}><sphereGeometry args={[.018 + i % 5 * .004, 5, 4]} /><meshBasicMaterial color="#e9f4ff" transparent opacity={THREE.MathUtils.smoothstep(flight?.altitude || 0, 110, 350)} /></mesh>)}
    <Rocket flight={flight} outcome={outcome} throttle={throttle} pitch={pitch} cameraMode={cameraMode} replay={replay} onSeparate={onSeparate} />
    <FailureDebris active={['maxq', 'steep', 'shallow'].includes(outcome?.reason)} />
    <OrbitPath missionId={missionId} targetName={targetName} deployed={Boolean(outcome?.success)} altitude={flight?.altitude || 0} texture={textures.target} />
    {flight?.maxQ && <mesh position={[0, 1, 0]} scale={[.9, 1.4, .7]}><sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#ff9c4b" transparent opacity={.11} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
    {flight?.altitude > 75 && flight?.altitude < 500 && <group>{Array.from({ length: 14 }, (_, i) => <mesh key={`speed-${i}`} position={[-4 + (i * 13 % 80) / 10, -2 + (i * 17 % 50) / 10, -3]}><boxGeometry args={[.012, .3 + i % 4 * .12, .012]} /><meshBasicMaterial color="#d7f1ff" transparent opacity={.12} /></mesh>)}</group>}
  </>
}

function SceneAssets(props) {
  const urls = ['/textures/2k_earth_daymap.jpg', '/textures/2k_earth_clouds.jpg', `/textures/${BODY_TEXTURES[props.targetName] || '2k_moon.jpg'}`]
  const loaded = useLoader(THREE.TextureLoader, urls)
  const textures = useMemo(() => {
    loaded.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace })
    return { earth: loaded[0], clouds: loaded[1], target: loaded[2] }
  }, [loaded])
  useEffect(() => () => {
    urls.forEach(url => useLoader.clear(THREE.TextureLoader, url))
    loaded.forEach(texture => texture.dispose())
  }, [loaded, urls.join('|')])
  return <Scenery {...props} textures={textures} />
}

function CanvasScene(props) {
  const [cameraMode, setCameraMode] = useState('chase')
  const [replay, toggleReplay, replayFrame] = useSlowReplay(props.flight, props.outcome)
  const toggleCamera = () => { setCameraMode(value => value === 'chase' ? 'side' : 'chase') }
  const c = props.sceneCopy || {}
  return <div className="launch-visual-wrap"><Canvas dpr={[1, 1.35]} frameloop="demand" camera={{ position: [0, 1.4, 8.5], fov: 48, near: .1, far: 120 }} gl={{ antialias: false, powerPreference: 'low-power' }}><Suspense fallback={null}><SceneAssets {...props} flight={replay ? replayFrame : props.flight} cameraMode={cameraMode} replay={replay} /></Suspense></Canvas><button className="camera-toggle" onClick={toggleCamera}>{c.camera || 'Camera'}: {cameraMode === 'chase' ? c.chase : c.side} ↻</button>{props.outcome?.success && <div className="orbit-achieved">{c.orbitAchieved || 'Orbit achieved · Payload deployed'}</div>}{props.outcome && !props.outcome.success && <button className="replay-toggle" onClick={toggleReplay}>{replay ? (c.replayOn || 'Replay: slow motion ON') : (c.replay || '◀ Slow-motion replay')}</button>}</div>
}

export default function LaunchScene(props) { return <CanvasScene {...props} /> }
