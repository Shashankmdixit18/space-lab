import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStudent } from '../../context/StudentContext'
import { useSettings } from '../../context/SettingsContext'
import { logActivity, getClassData } from '../../utils/tracker'
import LaunchSceneLite from './LaunchSceneLite'
import missionModeCopy from '../../data/learn/mission-mode.json'
import './launch.css'

const MISSIONS = [
  { name: 'Reach Low Earth Orbit', subtitle: 'Satellite delivery', goal: 'Place a satellite in a stable 400 km orbit.', difficulty: 'Beginner', target: 400, payload: 'Satellite', phase: 'Orbit Insertion', science: 'Low Earth orbit is a balance: the satellite moves forward fast enough that its fall around Earth continually misses the ground.' },
  { name: 'Fly to the Moon', subtitle: 'Inspired by Chandrayaan-3', goal: 'Send a lunar lander toward the Moon.', difficulty: 'Intermediate', target: 900, payload: 'Lunar lander', phase: 'Trans-lunar injection', science: 'A lunar journey needs extra speed to escape Earth’s neighborhood. Chandrayaan-3 used a sequence of orbit-raising burns before its lunar transfer.' },
  { name: 'Reach Mars orbit', subtitle: 'Inspired by Mangalyaan', goal: 'Place a Mars probe on an interplanetary trajectory.', difficulty: 'Advanced', target: 1450, payload: 'Mars probe', phase: 'Interplanetary transfer', science: 'Mangalyaan left Earth after carefully timed orbit-raising maneuvers. A small velocity change can make a large difference over a long journey.' },
  { name: 'Study the Sun from L1', subtitle: 'Inspired by Aditya-L1', goal: 'Send a solar observatory toward the Sun-Earth L1 region.', difficulty: 'Expert', target: 1900, payload: 'Solar observatory', phase: 'L1 transfer', science: 'Aditya-L1 studies the Sun from a halo orbit around the first Lagrange point, where the gravitational pulls of Earth and Sun help the spacecraft keep position.' },
]
const ROCKETS = [
  { id: 'small', name: 'Small launcher', thrust: 70, fuel: 55, payload: 2, cost: 1 },
  { id: 'medium', name: 'Medium launcher', thrust: 105, fuel: 78, payload: 5, cost: 3 },
  { id: 'heavy', name: 'Heavy launcher', thrust: 145, fuel: 100, payload: 9, cost: 6 },
]
const PAYLOADS = [
  { name: 'Satellite', mass: 1, missions: [0] }, { name: 'Lunar lander', mass: 3, missions: [1] },
  { name: 'Mars probe', mass: 4, missions: [2] }, { name: 'Solar observatory', mass: 5, missions: [3] },
]
const KEY = 'spacelab_mission_mode'
const LaunchScene3D = lazy(() => import('./LaunchScene'))
const safeRead = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

function FlightScene(props) { return props.liteMode ? <LaunchSceneLite {...props} /> : <Suspense fallback={<div className="launch-visual-wrap" aria-label="Loading launch scene" />}><LaunchScene3D {...props} /></Suspense> }

export default function Launch() {
  const { liteMode, language } = useSettings()
  const lang = language === 'hi' ? 'hi' : 'en'; const c = missionModeCopy[lang]
  const [searchParams] = useSearchParams()
  const requestedMission = Number(searchParams.get('mission'))
  const { student } = useStudent()
  const studentKey = `${student?.classCode || 'no-class'}-${student?.name || 'guest'}`.trim().toLowerCase().replace(/\W+/g, '-')
  const [saved, setSaved] = useState(() => safeRead(KEY, {}))
  const progress = saved[studentKey] || { unlocked: 0, best: {}, achievements: [] }
  const [screen, setScreen] = useState(() => requestedMission >= 1 && requestedMission <= 4 ? 'builder' : 'missions')
  const [missionId, setMissionId] = useState(() => requestedMission >= 1 && requestedMission <= 4 ? requestedMission - 1 : 0)
  const [rocketId, setRocketId] = useState('medium')
  const [payloadName, setPayloadName] = useState(() => PAYLOADS[(requestedMission >= 1 && requestedMission <= 4 ? requestedMission : 1) - 1].name)
  const [checks, setChecks] = useState([false, false, false])
  const [flight, setFlight] = useState(null)
  const [throttle, setThrottle] = useState(82)
  const [pitch, setPitch] = useState(78)
  const [report, setReport] = useState(null)
  const [event, setEvent] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const flightHistory = useRef([])
  const mission = { ...MISSIONS[missionId], ...c.missions[missionId] }
  const rocket = ROCKETS.find(item => item.id === rocketId)
  const payload = PAYLOADS.find(item => item.name === payloadName)
  const loadOK = payload.mass <= rocket.payload
  const stats = useMemo(() => ({ thrust: rocket.thrust, fuel: rocket.fuel, capacity: rocket.payload, cost: rocket.cost, twr: (rocket.thrust / (2 + payload.mass)).toFixed(1) }), [rocket, payload])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(saved)) } catch { /* local progress remains usable for this session */ }
  }, [saved])
  useEffect(() => {
    if (!student?.classCode) { setLeaderboard([]); return }
    const scores = getClassData(student.classCode).filter(row => row.topic === 'Rocket Physics' && row.result === 'success').map(row => ({ name: row.studentName, score: row.score || 0 }))
    setLeaderboard(scores.sort((a, b) => b.score - a.score).slice(0, 5))
  }, [student, report])

  const saveResult = (outcome) => {
    setReport(outcome)
    const nextBest = Math.max(progress.best[missionId] || 0, outcome.score)
    const achievements = new Set(progress.achievements)
    if (outcome.success && missionId === 0) achievements.add('First Orbit')
    if (outcome.success && outcome.perfect) achievements.add('Perfect Gravity Turn')
    if (outcome.success && outcome.fuelLeft >= 15) achievements.add('Fuel Saver')
    if (outcome.success && missionId === 3) achievements.add('Mission Commander')
    const next = { ...progress, unlocked: Math.max(progress.unlocked, outcome.success ? Math.min(3, missionId + 1) : missionId), best: { ...progress.best, [missionId]: nextBest }, achievements: [...achievements] }
    setSaved(prev => ({ ...prev, [studentKey]: next }))
    logActivity('launch', 'Rocket Physics', outcome.success ? 'success' : 'fail', { score: outcome.score, mission: mission.name })
    logActivity('launch', mission.name, outcome.success ? 'success' : 'fail', { score: outcome.score, mission: mission.name })
    setScreen('report')
  }

  const startFlight = () => {
    if (!checks.every(Boolean) || !loadOK) return
    setReport(null); setEvent(null); setThrottle(82); setPitch(78)
    flightHistory.current = []
    setFlight({ altitude: 0, speed: 0, fuel1: rocket.fuel * 0.62, fuel2: rocket.fuel * 0.38, g: 1, elapsed: 0, stage: 1, separated: false, eventDone: false, countdown: 3 })
    setScreen('flight')
  }

  useEffect(() => {
    if (!flight || screen !== 'flight' || report) return undefined
    const timer = setInterval(() => setFlight(prev => {
      if (!prev) return prev
      if (prev.countdown > 0) return { ...prev, countdown: prev.countdown - 1 }
      const elapsed = prev.elapsed + 1
      flightHistory.current = [...flightHistory.current, prev].slice(-6)
      const fuelKey = prev.stage === 1 ? 'fuel1' : 'fuel2'
      const fuelNow = prev[fuelKey]
      const burn = throttle / 100 * (prev.stage === 1 ? 2.3 : 1.65)
      const fuelNext = Math.max(0, fuelNow - burn)
      const thrustFactor = rocket.thrust / (70 + payload.mass * 8)
      const climb = Math.max(-8, (mission.target / 31) * (thrustFactor * throttle / 100 * Math.sin(pitch * Math.PI / 180) - 0.48) * 1.4)
      const altitude = Math.max(0, prev.altitude + climb)
      const speed = Math.max(0, prev.speed + (climb * 0.28))
      const g = Math.max(0.2, thrustFactor * throttle / 100 * 2.4)
      const maxQ = altitude > 45 && altitude < 170
      const next = { ...prev, [fuelKey]: fuelNext, altitude, speed, g, elapsed, maxQ, eventDone: prev.eventDone }
      if (!prev.eventDone && elapsed === 7 && missionId > 0) {
        const roll = (Date.now() + missionId) % 3
        if (roll === 0) setEvent({ type: 'fluctuation', text: c.events.fluctuation })
        else if (roll === 1) setEvent({ type: 'sensor', text: c.events.sensor })
        else setEvent({ type: 'weather', text: c.events.weather })
        next.eventDone = true
      }
      if (fuelNext <= 0 && prev.stage === 1 && !prev.separated) setEvent({ type: 'separate', text: c.events.separate })
      if (altitude >= mission.target || elapsed >= 50 || (altitude === 0 && elapsed > 5)) {
        clearInterval(timer)
        const angleBad = pitch < 30 ? 'shallow' : pitch > 72 ? 'steep' : null
        let reason = angleBad || (!prev.separated && altitude > 100 ? 'stage' : fuelNext <= 0 && !prev.separated ? 'fuel' : maxQ && throttle > 92 ? 'maxq' : null)
        if (elapsed >= 50) reason ||= 'fuel'
        const reached = altitude >= mission.target
        const success = reached && !reason && (prev.separated || missionId === 0)
        const partial = reached && !success && !['steep', 'shallow', 'maxq'].includes(reason)
        const score = Math.max(0, Math.round((success ? 500 : partial ? 220 : 60) + Math.min(240, altitude / mission.target * 240) + Math.min(150, (fuelNext / rocket.fuel) * 150) + (pitch >= 35 && pitch <= 65 ? 110 : 0)))
        const outcome = { success, partial, reason: reason || (partial ? 'orbit' : 'fuel'), score, altitude: Math.round(altitude), speed: Math.round(speed), fuelLeft: Math.round(fuelNext), perfect: pitch >= 40 && pitch <= 55, replayHistory: [...flightHistory.current, next].slice(-6), wentWell: success ? c.wentWellSuccess : c.wentWellReached.replace('{altitude}', String(Math.round(altitude))), wentWrong: reason ? reasonText(reason, c) : partial ? c.wentWrongOrbit : c.wentWrongTarget }
        saveResult(outcome)
        return { ...next, outcome }
      }
      return next
    }), 700)
    return () => clearInterval(timer)
  }, [flight, screen, report, throttle, pitch, rocket, payload, mission, missionId])

  const separate = () => { if (flight?.stage === 1 && (flight.fuel1 < 18 || flight.altitude > 110)) setFlight(prev => ({ ...prev, separated: true, separatedAt: prev.elapsed, stage: 2 })); else setEvent({ type: 'warning', text: c.stages.warning }) }
  const resolveEvent = choice => {
    if (event?.type === 'fluctuation' && choice === 'adjust' && throttle > 65) setThrottle(60)
    if (event?.type === 'sensor' && choice === 'ignore') setPitch(value => clamp(value + 10, 0, 90))
    if (event?.type === 'weather' && choice === 'hold') setThrottle(value => Math.max(35, value - 12))
    if (event?.type === 'weather' && choice === 'continue') setPitch(value => clamp(value + 7, 0, 90))
    setEvent(null)
  }
  const chooseMission = id => { setMissionId(id); setPayloadName(MISSIONS[id].payload); setChecks([false, false, false]); setScreen('builder') }

  if (screen === 'missions') return <main className="mission-page"><header className="mission-heading"><span>{c.kicker}</span><h1>{c.selectTitle}</h1><p>{c.selectIntro}</p></header><section className="mission-grid">{MISSIONS.map((base, i) => { const item = { ...base, ...c.missions[i] }; const locked = i > progress.unlocked; return <article key={base.name} className={`mission-card ${locked ? 'is-locked' : ''}`}><div className="mission-card-top"><span>{c.mission} 0{i + 1}</span><span>{locked ? `🔒 ${c.locked}` : item.difficulty}</span></div><h2>{item.name}</h2><p className="mission-subtitle">{item.subtitle}</p><p>{item.goal}</p><div className="mission-meta"><span>{c.best} <b>{progress.best[i] || '—'}</b></span><span>{c.difficulty} <b>{item.difficulty}</b></span></div><button disabled={locked} onClick={() => chooseMission(i)}>{locked ? c.lockedAction : c.select}</button></article> })}</section><section className="mission-lower"><div><h2>{c.achievements}</h2><p>{progress.achievements.length ? progress.achievements.join(' · ') : c.achievementEmpty}</p></div><div><h2>{c.leaderboard} {student?.classCode ? `· ${student.classCode}` : ''}</h2>{leaderboard.length ? leaderboard.map((row, i) => <p key={`${row.name}-${i}`}>{i + 1}. {row.name} — {row.score}</p>) : <p>{c.classResults}</p>}</div></section></main>

  if (screen === 'builder') return <main className="mission-page"><button className="mission-back" onClick={() => setScreen('missions')}>{c.backMission}</button><header className="mission-heading"><span>{c.mission} 0{missionId + 1} · {c.builder}</span><h1>{mission.name}</h1><p>{mission.goal}</p></header><div className="builder-grid"><section className="mission-panel"><h2>{c.chooseLauncher}</h2><div className="choice-row">{ROCKETS.map(r => <button className={rocketId === r.id ? 'selected' : ''} key={r.id} onClick={() => setRocketId(r.id)}><b>{c.rockets[r.id]}</b><span>{r.thrust} {c.thrust} · {r.fuel} {c.fuel}</span><span>{c.payloadCapacity} {r.payload} t · {c.cost} {r.cost} {c.credits}</span></button>)}</div><h2>{c.choosePayload}</h2><div className="choice-row payload-row">{PAYLOADS.map(p => <button className={payloadName === p.name ? 'selected' : ''} key={p.name} onClick={() => setPayloadName(p.name)}><b>{c.payloads[p.name]}</b><span>{c.mass} {p.mass} t</span></button>)}</div><div className={`load-warning ${loadOK ? '' : 'bad'}`}>{loadOK ? c.compatible : c.tooHeavy}</div></section><aside className="mission-panel"><h2>{c.tradeoffs}</h2><dl className="stats-list"><dt>{c.thrust}</dt><dd>{stats.thrust} kN</dd><dt>{c.fuelCapacity}</dt><dd>{stats.fuel} {c.fuelUnits}</dd><dt>{c.payloadCapacity}</dt><dd>{stats.capacity} t</dd><dt>{c.payloadMass}</dt><dd>{payload.mass} t</dd><dt>{c.cost}</dt><dd>{stats.cost} {c.credits}</dd><dt>{c.thrustWeight}</dt><dd>{stats.twr}</dd></dl><p>{c.tradeoffText}</p><button disabled={!loadOK} onClick={() => setScreen('checklist')}>{c.continue}</button></aside></div></main>

  if (screen === 'checklist') return <main className="mission-page"><button className="mission-back" onClick={() => setScreen('builder')}>{c.backBuilder}</button><header className="mission-heading"><span>{c.preflight}</span><h1>{c.ready}</h1></header><section className="mission-panel checklist">{c.checklist.map((label, i) => <label key={label}><input type="checkbox" checked={checks[i]} onChange={e => setChecks(old => old.map((v, n) => n === i ? e.target.checked : v))} />{label}</label>)}<button disabled={!checks.every(Boolean)} onClick={startFlight}>{c.countdown}</button></section></main>

  if (screen === 'report' && report) return <main className="mission-page"><header className="mission-heading"><span>{c.report} · 0{missionId + 1}</span><h1>{report.success ? c.successTitle : report.partial ? c.partialTitle : c.failureTitle}</h1><p>{report.reason && !report.success ? `${c.failureReason}: ${reasonText(report.reason, c)}` : c.complete}</p></header><FlightScene liteMode={liteMode} language={lang} sceneCopy={c} flight={flight} outcome={report} missionId={missionId} targetName={['Earth', 'Moon', 'Mars', 'Sun'][missionId]} rocket={rocket} throttle={throttle} pitch={pitch} /><section className="mission-panel report-grid"><div><strong className="report-score">{report.score}</strong><span> {c.score} · {'★'.repeat(report.score > 800 ? 3 : report.score > 500 ? 2 : 1)}</span><p><b>{c.wentWell}</b> {report.wentWell}</p><p><b>{c.needsWork}</b> {report.wentWrong}</p></div><div><h2>{c.science}</h2><p>{mission.science}</p><Link to={`/learn/topics/${['orbits','moon','orbits','gravity'][missionId]}`} className="mission-link">{c.learnWhy}</Link></div></section><div className="report-actions"><button onClick={() => { setChecks([false, false, false]); setScreen('builder') }}>{c.retry}</button><button className="secondary" onClick={() => setScreen('missions')}>{c.missionSelect}</button></div></main>

  return <main className="mission-page"><header className="mission-heading"><span>{c.mission} 0{missionId + 1} · {c.flight}</span><h1>{mission.name}</h1></header><div className="flight-grid"><section className="mission-panel flight-scene"><FlightScene liteMode={liteMode} language={lang} sceneCopy={c} flight={flight} outcome={null} missionId={missionId} targetName={['Earth', 'Moon', 'Mars', 'Sun'][missionId]} rocket={rocket} throttle={throttle} pitch={pitch} onSeparate={() => {}} /><p>{flight?.countdown > 0 ? `T− ${flight.countdown}` : c.ascent}</p><div className="flight-hud"><span>{c.altitude} <b>{Math.round(flight?.altitude || 0)} km</b></span><span>{c.speed} <b>{Math.round(flight?.speed || 0)} km/s</b></span><span>{c.gforce} <b>{(flight?.g || 1).toFixed(1)} g</b></span><span>{c.phase} <b>{flight?.countdown > 0 ? c.phases.countdown : flight?.maxQ ? c.phases.maxq : flight?.separated ? c.phases.insertion : flight?.altitude > 100 ? c.phases.separation : c.phases.liftoff}</b></span></div><label className="stage-fuel">{c.stage1}<progress max={rocket.fuel * .62} value={flight?.fuel1 || 0} /></label><label className="stage-fuel">{c.stage2}<progress max={rocket.fuel * .38} value={flight?.fuel2 || 0} /></label><p className={`separation-window ${flight?.fuel1 < 18 ? 'open' : ''}`}>{c.separationWindow} {flight?.fuel1 < 18 ? c.open : c.nearEmpty}</p></section><section className="mission-panel flight-controls"><h2>{c.controls}</h2><label>{c.pitch} <b>{pitch}°</b><input type="range" min="0" max="90" value={pitch} onChange={e => setPitch(Number(e.target.value))} /></label><p>{c.pitchHelp}</p><label>{c.throttle} <b>{throttle}%</b><input type="range" min="35" max="100" value={throttle} onChange={e => setThrottle(Number(e.target.value))} /></label><p>{c.throttleHelp}</p><button className="separate-button" disabled={flight?.stage !== 1} onClick={separate}>{c.separate}</button></section></div>{event && <div className="mission-event" role="dialog"><b>{event.text}</b>{event.type === 'weather' ? <><button onClick={() => resolveEvent('hold')}>{c.weatherHold}</button><button className="secondary" onClick={() => resolveEvent('continue')}>{c.weatherContinue}</button></> : <><button onClick={() => resolveEvent(event.type === 'fluctuation' ? 'adjust' : 'ack')}>{event.type === 'fluctuation' ? c.eventAdjust : c.eventAck}</button>{event.type === 'sensor' && <button className="secondary" onClick={() => resolveEvent('ignore')}>{c.eventIgnore}</button>}</>}</div>}</main>
}

function reasonText(reason, copy) { return copy?.reasons?.[reason] || reason }
