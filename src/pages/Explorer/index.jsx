import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { useT } from '../../hooks/useT'
import { logActivity } from '../../utils/tracker'
import planets from '../../data/planets.json'
import HUDPanel from '../../components/cockpit/HUDPanel'
import CockpitSlider from '../../components/cockpit/CockpitSlider'
import CockpitButton from '../../components/cockpit/CockpitButton'
import './explorer.css'

const ExplorerScene = lazy(() => import('./ExplorerScene'))
const moon = { name: 'Moon', name_hi: 'चंद्रमा', distance_from_sun_km: 149984400, diameter_km: 3475, orbital_period: { value: 27.3, unit: 'days' }, fun_fact_en: 'The Moon is slowly moving away from Earth.', fun_fact_hi: 'चंद्रमा धीरे-धीरे पृथ्वी से दूर जा रहा है।' }
const facts = {
  Sun: ['25 days (equator)', '0', '5,500°C photosphere', 'Hydrogen and helium; outer atmosphere is the corona', '25 दिन (भूमध्य रेखा)', '0', '5,500°C प्रकाशमंडल', 'हाइड्रोजन और हीलियम; बाहरी वायुमंडल कोरोना'],
  Mercury: ['58.6 days', '0', '−180 to 430°C', 'Extremely thin exosphere', '58.6 दिन', '0', '−180 से 430°C', 'अत्यंत विरल बहिर्मंडल'],
  Venus: ['243 days (retrograde)', '0', 'About 465°C at the surface', 'Dense carbon dioxide; sulfuric-acid clouds', '243 दिन (विपरीत दिशा)', '0', 'सतह पर लगभग 465°C', 'घना कार्बन डाइऑक्साइड; सल्फ्यूरिक अम्ल के बादल'],
  Earth: ['23 h 56 min', '1', 'About −90 to 60°C', 'Nitrogen and oxygen', '23 घंटे 56 मिनट', '1', 'लगभग −90 से 60°C', 'नाइट्रोजन और ऑक्सीजन'],
  Mars: ['24 h 37 min', '2', 'About −125 to 20°C', 'Thin carbon dioxide atmosphere', '24 घंटे 37 मिनट', '2', 'लगभग −125 से 20°C', 'पतला कार्बन डाइऑक्साइड वायुमंडल'],
  Jupiter: ['9 h 56 min', '115*', 'Mean about −110°C (cloud level)', 'Mostly hydrogen and helium', '9 घंटे 56 मिनट', '115*', 'औसत लगभग −110°C (बादल स्तर)', 'मुख्यतः हाइड्रोजन और हीलियम'],
  Saturn: ['10 h 42 min', '293*', 'Mean about −140°C (cloud level)', 'Mostly hydrogen and helium', '10 घंटे 42 मिनट', '293*', 'औसत लगभग −140°C (बादल स्तर)', 'मुख्यतः हाइड्रोजन और हीलियम'],
  Uranus: ['17 h 14 min (retrograde)', '29*', 'Mean about −195°C (cloud level)', 'Hydrogen, helium, and methane', '17 घंटे 14 मिनट (विपरीत दिशा)', '29*', 'औसत लगभग −195°C (बादल स्तर)', 'हाइड्रोजन, हीलियम और मीथेन'],
  Neptune: ['16 h 6 min', '16*', 'Mean about −200°C (cloud level)', 'Hydrogen, helium, and methane', '16 घंटे 6 मिनट', '16*', 'औसत लगभग −200°C (बादल स्तर)', 'हाइड्रोजन, हीलियम और मीथेन'],
  Moon: ['27.3 days', '0', 'About −173 to 127°C', 'Exosphere; extremely thin', '27.3 दिन', '0', 'लगभग −173 से 127°C', 'बहिर्मंडल; अत्यंत विरल'],
}
const labels = {
  en: { diameter: 'Diameter', day: 'Rotation / day', year: 'Year length', moons: 'Known moons', temperature: 'Temperature', atmosphere: 'Atmosphere', fact: 'Did you know?', learn: 'Learn more', close: 'Close panel', loading: 'Loading planets {loaded}/10', scale: 'Scale mode', easy: 'Easy view', real: 'Real proportions', proportions: 'Relative diameter (Earth = 1)', sunNote: 'Distances are never fully to scale on a screen.', system: 'Solar system', selected: 'Selected world', reset: 'Reset view', zoomIn: 'Zoom in', zoomOut: 'Zoom out', speed: 'Orbit speed', play: 'Play', pause: 'Pause', tapped: 'Select a planet or the Sun', loadError: 'Some map textures could not load; retry the page to try again.',
  },
  hi: { diameter: 'व्यास', day: 'घूर्णन / दिन', year: 'वर्ष की अवधि', moons: 'ज्ञात चंद्रमा', temperature: 'तापमान', atmosphere: 'वायुमंडल', fact: 'क्या आप जानते हैं?', learn: 'और जानें', close: 'पैनल बंद करें', loading: 'ग्रह लोड हो रहे हैं {loaded}/10', scale: 'आकार मोड', easy: 'आसान दृश्य', real: 'वास्तविक अनुपात', proportions: 'सापेक्ष व्यास (पृथ्वी = 1)', sunNote: 'स्क्रीन पर दूरियाँ पूरी तरह पैमाने के अनुसार नहीं दिखाई जा सकतीं।', system: 'सौर मंडल', selected: 'चयनित पिंड', reset: 'दृश्य रीसेट', zoomIn: 'ज़ूम बढ़ाएँ', zoomOut: 'ज़ूम घटाएँ', speed: 'कक्षा की गति', play: 'चलाएँ', pause: 'रोकें', tapped: 'ग्रह या सूर्य चुनें', loadError: 'कुछ सतह मानचित्र लोड नहीं हुए; फिर प्रयास करने के लिए पृष्ठ रीफ्रेश करें।' }
}
function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); if (!gl) return false; gl.getExtension('WEBGL_lose_context')?.loseContext(); return true } catch { return false }
}
const displayName = (planet, language) => language === 'hi' ? planet.name_hi : planet.name
function LiteSystem({ onSelect, language, t, zoom }) {
  const orbitRadii = [48, 76, 104, 132, 164, 208, 248, 288]
  const angles = [-1.35, -.35, 2.1, -.9, .4, 2.6, -.15, 1.45]
  const points = planets.slice(1).map((planet, index) => ({ planet, x: 400 + Math.cos(angles[index]) * orbitRadii[index], y: 250 + Math.sin(angles[index]) * orbitRadii[index] * .62, radius: [4, 7, 7, 5, 19, 16, 12, 11][index] }))
  points.push({ planet: moon, x: 452, y: 270, radius: 5 })
  return <div className="explorer-lite-scene"><svg viewBox="0 0 800 500" role="img" aria-label={t('explorer.sceneLabel')}>
    <defs><radialGradient id="lite-sun"><stop stopColor="#fff5bb"/><stop offset=".55" stopColor="#ffae36"/><stop offset="1" stopColor="#ff6b35"/></radialGradient><filter id="lite-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {Array.from({ length: 100 }, (_, i) => <circle key={i} cx={(i * 173 + 17) % 800} cy={(i * 97 + 31) % 500} r={i % 7 === 0 ? 1.5 : .8} fill="#c9eaff" opacity={i % 4 === 0 ? .75 : .34}/>) }
    <g transform={`translate(400 250) scale(${zoom}) translate(-400 -250)`}>
    {orbitRadii.map((radius, index) => <ellipse key={radius} cx="400" cy="250" rx={radius} ry={radius * .62} fill="none" stroke="#47c8ff" strokeOpacity={index < 4 ? .24 : .16} strokeWidth="1"/>)}
    <circle cx="400" cy="250" r="20" fill="url(#lite-sun)" filter="url(#lite-glow)" role="button" tabIndex="0" aria-label={displayName(planets[0], language)} onClick={() => onSelect(planets[0])} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(planets[0])}/>
    {points.map(({ planet, x, y, radius }) => <g key={planet.name} role="button" tabIndex="0" aria-label={displayName(planet, language)} onClick={() => onSelect(planet)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(planet)} className="lite-planet-hit">
      {planet.name === 'Saturn' && <ellipse cx={x} cy={y} rx={radius * 1.8} ry={radius * .55} fill="none" stroke="#e7d39c" strokeWidth="3" opacity=".85"/>}<circle cx={x} cy={y} r={radius + 8} fill="transparent"/><circle cx={x} cy={y} r={radius} fill={planet.display_color} stroke="#e7f7ff" strokeOpacity=".4"/><title>{displayName(planet, language)}</title>
    </g>)}
    </g>
  </svg><span className="explorer-lite-hint">{t('explorer.tapHint')}</span></div>
}
function SizeComparison({ language }) {
  const sizes = planets.filter(p => p.name !== 'Sun')
  const labelsByLanguage = labels[language]
  return <HUDPanel className="explorer-size-panel" code="SCALE-02" label={labelsByLanguage.proportions}>
    <div className="explorer-size-rows">{sizes.map(planet => <div key={planet.name} className="explorer-size-row"><span>{displayName(planet, language)}</span><span className="explorer-size-track"><i style={{ width: `${(planet.diameter_km / 142984) * 100}%` }}/></span><b>{(planet.diameter_km / 12756).toFixed(2)}×</b></div>)}</div>
  </HUDPanel>
}
function PlanetInfo({ planet, language, onClose }) {
  if (!planet) return null
  const fact = facts[planet.name] || facts.Moon; const base = language === 'hi' ? 4 : 0
  const orbital = planet.name === 'Sun' ? '—' : `${planet.orbital_period.value} ${planet.orbital_period.unit === 'days' ? (language === 'hi' ? 'दिन' : 'days') : 'days'}`
  const distance = planet.name === 'Sun' ? (language === 'hi' ? 'केंद्र' : 'Center') : `${new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-US').format(planet.distance_from_sun_km)} km`
  const entries = [[labels[language].diameter, `${new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-US').format(planet.diameter_km)} km`], [labels[language].day, fact[base]], [labels[language].year, orbital], [labels[language].moons, fact[base + 1]], [labels[language].temperature, fact[base + 2]], [labels[language].atmosphere, fact[base + 3]], [language === 'hi' ? 'सूर्य से औसत दूरी' : 'Mean distance from Sun', distance]]
  return <HUDPanel as="aside" code="SYS-04" label={labels[language].selected} className="explorer-info hud-flicker" aria-live="polite" aria-label={displayName(planet, language)}>
    <button className="explorer-info-close cockpit-button cockpit-button--icon" type="button" onClick={onClose} aria-label={labels[language].close}>×</button>
    <span className="explorer-info-eyebrow">{labels[language].selected}</span><h2>{displayName(planet, language)}</h2>
    <dl>{entries.map(([title, value]) => <div key={title}><dt>{title}</dt><dd>{value}</dd></div>)}</dl>
    <p className="explorer-fact-label">{labels[language].fact}</p><p className="explorer-fact">{language === 'hi' ? planet.fun_fact_hi : planet.fun_fact_en}</p>
    <Link className="cockpit-button cockpit-button--scan explorer-learn" to={`/learn/planets/${planet.name.toLowerCase()}`}>{labels[language].learn} ↗</Link>
  </HUDPanel>
}
export default function Explorer() {
  const { liteMode } = useSettings(); const { t, language } = useT()
  const [webgl] = useState(() => supportsWebGL()); const [smallScreen, setSmallScreen] = useState(() => matchMedia('(max-width: 700px)').matches)
  const [selected, setSelected] = useState(null); const [playing, setPlaying] = useState(true); const [speed, setSpeed] = useState(1); const [zoom, setZoom] = useState(1); const [scaleMode, setScaleMode] = useState('easy'); const [resetKey, setResetKey] = useState(0); const [progress, setProgress] = useState({ loaded: 0, total: 14, complete: false, error: false })
  useEffect(() => { const media = matchMedia('(max-width: 700px)'); const update = () => setSmallScreen(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  const low = liteMode || smallScreen; const isLite = liteMode || smallScreen || !webgl
  const selectPlanet = useCallback(planet => { setSelected(planet); logActivity('planet', 'Planets', planet.name) }, [])
  const reportProgress = useCallback(value => setProgress(value), [])
  const currentLabels = labels[language]
  return <main className="explorer-page">
    <header className="explorer-heading"><span>{t('explorer.kicker')}</span><h1>{t('pages.explorer.title')}</h1><p>{t('explorer.description')}</p></header>
    <div className="explorer-mode-row"><span>{currentLabels.scale}</span><div className="explorer-mode-toggle"><button type="button" aria-pressed={scaleMode === 'easy'} onClick={() => setScaleMode('easy')}>{currentLabels.easy}</button><button type="button" aria-pressed={scaleMode === 'real'} onClick={() => setScaleMode('real')}>{currentLabels.real}</button></div></div>
    <HUDPanel as="section" code="SYS-05" label={currentLabels.system} className={`explorer-viewport ${selected ? 'has-selection' : ''} ${isLite ? 'explorer-lite-mode' : ''}`} aria-label={t('explorer.sceneLabel')}>
      {isLite ? <LiteSystem onSelect={selectPlanet} language={language} t={t} zoom={zoom}/> : <Suspense fallback={<div className="explorer-loading">{currentLabels.loading.replace('{loaded}', '0')}</div>}>
        <ExplorerScene planets={planets} selected={selected} onSelect={selectPlanet} scaleMode={scaleMode} resetKey={resetKey} low={low} playing={playing} speed={speed} zoom={zoom} onProgress={reportProgress} language={language}/>
      </Suspense>}
      {!isLite && !progress.complete && <div className="explorer-loading" aria-live="polite"><div><span>{currentLabels.loading.replace('{loaded}', String(Math.min(10, Math.floor((progress.loaded / Math.max(progress.total, 1)) * 10))))}</span><div className="explorer-loading-track"><i style={{ width: `${Math.floor(progress.loaded / Math.max(progress.total, 1) * 100)}%` }}/></div></div></div>}
      {isLite && <span className="explorer-lite-badge">{liteMode ? t('explorer.liteBadge') : t('explorer.twoDBadge')}</span>}
      {selected && <PlanetInfo planet={selected} language={language} onClose={() => setSelected(null)}/>}
      <div className="explorer-zoom-controls" role="group" aria-label={language === 'hi' ? 'दृश्य ज़ूम' : 'View zoom'}>
        <button type="button" aria-label={currentLabels.zoomOut} title={currentLabels.zoomOut} disabled={zoom <= .65} onClick={() => setZoom(value => Math.max(.65, Number((value - .2).toFixed(2))))}>−</button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" aria-label={currentLabels.zoomIn} title={currentLabels.zoomIn} disabled={zoom >= 2.4} onClick={() => setZoom(value => Math.min(2.4, Number((value + .2).toFixed(2))))}>+</button>
      </div>
      <div className="explorer-controls">
        {!isLite && <CockpitButton variant="scan" onClick={() => setPlaying(v => !v)}>{playing ? 'Ⅱ' : '▶'} <span>{playing ? currentLabels.pause : currentLabels.play}</span></CockpitButton>}
        {!isLite && <label className="explorer-speed">{currentLabels.speed}<CockpitSlider min="0.25" max="3" step="0.25" value={speed} onChange={e => setSpeed(Number(e.target.value))}/><output>{speed}×</output></label>}
        <CockpitButton variant="scan" onClick={() => { setSelected(null); setPlaying(true); setSpeed(1); setZoom(1); setResetKey(key => key + 1) }}>⌖ <span>{currentLabels.reset}</span></CockpitButton>
      </div>
    </HUDPanel>
    {scaleMode === 'real' && <SizeComparison language={language}/>}
    <p className="explorer-footnote">{currentLabels.sunNote} {language === 'hi' ? ' *चंद्रमा की संख्या बदल सकती है; नवीनतम आँकड़े जाँचें।' : '*Moon counts can change; check current NASA figures.'}</p>
    {progress.error && !isLite && <p className="explorer-footnote">{currentLabels.loadError}</p>}
  </main>
}
