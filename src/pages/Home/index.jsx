import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { useStudent } from '../../context/StudentContext'
import { useGsap } from '../../hooks/useGsap'
import { useT } from '../../hooks/useT'
import HeroText from './HeroText'
import HeroAstronaut from './HeroAstronaut'
import Reveal from '../../components/Reveal'
import { Counter, CustomCursor, MagneticButton, SplitText, TiltCard } from '../../components/fx'
import { Card } from '@/components/ui/card'
import Button4 from '../../components/button-4'
import HUDPanel from '../../components/cockpit/HUDPanel'
import './home.css'

const missions = [
  { year: '1975', key: 'aryabhata', tag: 'factsLabel' }, { year: '2008', key: 'chandrayaan1', tag: 'moonOrbiter' },
  { year: '2013', key: 'mangalyaan', tag: 'marsOrbiter' }, { year: '2023', key: 'chandrayaan3', tag: 'moonLanderRover' },
  { year: '2023', key: 'adityaL1', tag: 'solarObservatory' }, { year: 'IN DEVELOPMENT', key: 'gaganyaan', tag: 'humanSpaceflight', dev: true },
]

function Hero() {
  const { t } = useT()
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 'calc(100svh - 56px)' }}>
      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(90deg,rgba(5,10,20,.94),rgba(5,10,20,.4) 70%),linear-gradient(0deg,#050a14,transparent 45%)' }} />
      <HeroAstronaut />
      <div className="absolute inset-0 z-[2]"><HeroText /></div>
      <div className="absolute bottom-6 left-1/2 z-[3] hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex" aria-hidden="true">
        <span className="text-[10px] uppercase tracking-[.3em] text-slate-400">{t('hero.scrollHint')}</span><span className="h-8 w-px bg-gradient-to-b from-cyan-400 to-transparent" />
      </div>
    </section>
  )
}

function Journey() {
  const { t } = useT()
  const { liteMode } = useSettings()
  const ref = useGsap((gsap, el) => {
    if (liteMode) return
    const scene = el.querySelector('.journey-track')
    const captions = gsap.utils.toArray(el.querySelectorAll('.journey-caption'))
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=2200', scrub: 1, pin: true, anticipatePin: 1 } })
    tl.to(scene, { '--journey-progress': 1, ease: 'none', duration: 3 }, 0)
    tl.to(el.querySelector('.earth'), { x: -150, scale: .72, ease: 'none', duration: 3 }, 0)
    tl.to(el.querySelector('.moon'), { x: -65, y: -24, scale: .9, ease: 'none', duration: 3 }, 0)
    tl.to(el.querySelector('.mars'), { x: 115, scale: 1.35, ease: 'none', duration: 3 }, 0)
    captions.forEach((caption, i) => {
      const at = i
      tl.fromTo(caption, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .35 }, at)
      tl.to(caption, { autoAlpha: 0, y: -10, duration: .35 }, at + .65)
    })
  }, [liteMode])

  return (
    <section ref={ref} className={`journey-section section-shell ${liteMode ? 'journey-lite' : ''}`} aria-labelledby="journey-title">
      <div className="section-kicker">{t('home.journey.kicker')}</div>
      <SplitText as="h2" id="journey-title" className="section-title">{t('home.journey.title')}</SplitText>
      <p className="section-intro">{t('home.journey.intro')}</p>
      <div className="journey-stage">
        <div className="journey-track" aria-hidden="true">
          <div className="journey-orbit" />
          <div className="journey-planet earth"><span>{t('home.journey.earthLabel')}</span></div>
          <div className="journey-planet moon"><span>{t('home.journey.moonLabel')}</span></div>
          <div className="journey-planet mars"><span>{t('home.journey.marsLabel')}</span></div>
          <div className="journey-ship">
            <svg className="journey-spacecraft" viewBox="0 0 112 52" fill="none" aria-hidden="true">
              <path d="M8 9h25v34H8zM79 9h25v34H79z" fill="#183c60" stroke="#75b9e4" strokeWidth="1.5" />
              <path d="M13 9v34M20 9v34M27 9v34M84 9v34M91 9v34M98 9v34" stroke="#5b9bca" strokeWidth="1" opacity=".8" />
              <path d="M37 18 49 12h17l13 8v12l-13 8H49L37 34z" fill="#c8d4dd" stroke="#f4f7f8" strokeWidth="1.5" />
              <path d="M49 14h15v24H49z" fill="#9b7846" stroke="#e1c58a" strokeWidth="1" />
              <path d="m79 20 15 6-15 6" fill="#f1a75c" opacity=".9" />
              <circle cx="55" cy="26" r="3" fill="#68d8ff" />
              <path d="M43 26H25M88 26h15" stroke="#d9e9f2" strokeWidth="1.3" />
            </svg>
          </div>
        </div>
        <div className="journey-caption-stack" aria-live="polite">
          <p className="journey-caption">{t('home.journey.earth')}</p>
          <p className="journey-caption">{t('home.journey.moon')}</p>
          <p className="journey-caption">{t('home.journey.mars')}</p>
        </div>
      </div>
      {liteMode && <p className="lite-note">{t('home.journey.liteNote')}</p>}
    </section>
  )
}

function MissionTimeline() {
  const { t } = useT()
  const { liteMode } = useSettings()
  const ref = useGsap((gsap, el) => {
    if (liteMode) return
    const track = el.querySelector('.mission-track')
    const distance = () => Math.max(0, track.scrollWidth - el.querySelector('.mission-viewport').clientWidth)
    gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true } })
  }, [liteMode])
  return (
    <section ref={ref} className={`timeline-section section-shell ${liteMode ? 'timeline-lite' : ''}`} aria-labelledby="timeline-title">
      <div className="section-kicker">{t('home.timeline.kicker')}</div>
      <SplitText as="h2" id="timeline-title" className="section-title">{t('home.timeline.title')}</SplitText>
      <p className="section-intro">{t('home.timeline.intro')}</p>
      <div className="mission-viewport">
        <div className="mission-track">
          {missions.map((mission, i) => <Card as="article" className="mission-card hud-panel" key={mission.key}>
            <span className="hud-panel-tag" aria-hidden="true"><b>LOG-{String(i + 1).padStart(2, '0')}</b><i>MISSION ARCHIVE</i></span>
            <div className="mission-index">0{i + 1} <span>— {t(`home.timeline.${mission.tag}`)}</span></div>
            <div className="mission-year">{mission.dev ? t('home.timeline.inDevelopment') : mission.year}</div>
            <h3>{t(`home.timeline.missions.${mission.key}.name`)}</h3><p>{t(`home.timeline.missions.${mission.key}.text`)}</p>
            <span className="mission-arrow" aria-hidden="true">↗</span>
          </Card>)}
        </div>
      </div>
      <details className="fact-check">
        <summary>{t('home.timeline.verifyTitle')}</summary>
        <p>{t('home.timeline.verifyBody')}</p>
        <p className="source-links">{t('home.timeline.sourcesLabel')} <a href="https://www.isro.gov.in/ISRO_EN/aryabhata_1.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.aryabhata')}</a> · <a href="https://www.isro.gov.in/FAQ.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.chandrayaan1')}</a> · <a href="https://www.isro.gov.in/ISRO_EN/FAQ_MarsOrbiterMission.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.mangalyaan')}</a> · <a href="https://www.isro.gov.in/Chandrayaan3.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.chandrayaan3')}</a> · <a href="https://www.isro.gov.in/Aditya_L1.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.adityaL1')}</a> · <a href="https://www.isro.gov.in/ISRO_EN/FAQ_Gaganyaan.html" target="_blank" rel="noreferrer">{t('home.timeline.sources.gaganyaan')}</a></p>
      </details>
    </section>
  )
}

function Features() {
  const { t } = useT()
  const { liteMode } = useSettings()
  const ref = useGsap((gsap, el) => {
    if (liteMode) return
    const cards = el.querySelectorAll('.feature-card')
    gsap.fromTo(cards, { autoAlpha: 0, y: 38 }, { autoAlpha: 1, y: 0, duration: .65, stagger: .16, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 78%' } })
  }, [liteMode])
  const cards = [
    { icon: '🪐', key: 'explore', to: '/explorer' }, { icon: '🚀', key: 'launch', to: '/launch' }, { icon: '✨', key: 'quiz', to: '/quiz' },
  ]
  return <section ref={ref} className={`features-section section-shell ${liteMode ? 'features-lite' : ''}`} aria-labelledby="features-title">
    <div className="section-kicker">{t('home.features.kicker')}</div><SplitText as="h2" id="features-title" className="section-title">{t('home.features.title')}</SplitText>
    <div className="features-grid">{cards.map((card, index) => <Card className="feature-card-shell" key={card.key}><TiltCard as={Link} to={card.to} className="feature-card hud-panel">
      <span className="hud-panel-tag" aria-hidden="true"><b>SYS-{String(13 + index).padStart(2, '0')}</b><i>MODULE</i></span>
      <span className="feature-icon" aria-hidden="true">{card.icon}</span><h3>{t(`home.features.${card.key}Title`)}</h3><p>{t(`home.features.${card.key}Text`)}</p><span className="feature-action">{t(`home.features.${card.key}Action`)} <span aria-hidden="true">→</span></span>
    </TiltCard></Card>)}</div>
  </section>
}

function Marquee() {
  const { t } = useT()
  const words = ['SPACE', 'अंतरिक्ष', 'DISCOVER', 'खोज', 'ORBIT', 'कक्षा', 'DREAM BIG', 'बड़े सपने']
  return <div className="space-marquee" aria-label={t('home.marqueeLabel')} role="note"><div className="marquee-track" aria-hidden="true">{[0, 1].map(copy => <div className="marquee-group" key={copy}>{words.map(word => <span key={`${copy}-${word}`}>{word}<b>✦</b></span>)}</div>)}</div></div>
}

function MissionBriefing() {
  const { t } = useT()
  const { student, joinClass, leaveClass } = useStudent()
  const [name, setName] = useState(student?.name || '')
  const [classCode, setClassCode] = useState(student?.classCode || '')
  const [error, setError] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (!name.trim() || !classCode.trim()) { setError(t('home.briefing.required')); return }
    joinClass({ name, classCode: classCode.toUpperCase() })
    setError('')
  }
  return <section className="briefing-wrap" id="mission-briefing">
    <HUDPanel as="div" code="SYS-14" label={t('home.briefing.kicker')} className="briefing-card hud-flicker">
      <div className="briefing-copy"><div className="section-kicker">{t('home.briefing.kicker')}</div><h2 className="section-title">{t('home.briefing.title')}</h2><p>{t('home.briefing.intro')}</p><div className="briefing-stamp">{t('home.briefing.stamp')}</div></div>
      {student ? <div className="briefing-success" role="status"><span className="success-orbit">✓</span><div><span className="briefing-label">{t('home.briefing.confirmed')}</span><h3>{t('home.briefing.welcome', { name: student.name })}</h3><p>{t('home.briefing.code')} <strong>{student.classCode}</strong></p><button type="button" className="text-button cockpit-button cockpit-button--scan" onClick={leaveClass}>{t('home.briefing.changeStudent')}</button></div></div> : <form className="briefing-form" onSubmit={submit} noValidate>
        <label htmlFor="student-name">{t('home.briefing.nameLabel')}</label><input id="student-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('home.briefing.namePlaceholder')} />
        <label htmlFor="class-code">{t('home.briefing.classCodeLabel')}</label><input id="class-code" value={classCode} onChange={e => setClassCode(e.target.value.toUpperCase())} placeholder={t('home.briefing.classCodePlaceholder')} autoCapitalize="characters" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <MagneticButton as={Button4} type="submit" className="briefing-submit cockpit-button cockpit-button--ignite">{t('home.briefing.submit')}</MagneticButton>
        <p className="form-privacy">{t('home.briefing.privacy')}</p>
      </form>}
    </HUDPanel>
  </section>
}

function CounterCard({ label, end, suffix = '' }) {
  return <HUDPanel as={Card} code="SYS-15" label={label} className="counter-card"><Counter className="counter-val" value={end} suffix={suffix} /><span>{label}</span></HUDPanel>
}

export default function Home() {
  const { t } = useT()
  return <div className="home-page"><CustomCursor /><Hero /><Journey /><MissionTimeline /><Features /><Marquee /><MissionBriefing />
    <section className="stats-section section-shell"><Reveal><h2 className="section-title">{t('home.stats.title')}</h2><p className="section-intro">{t('home.stats.intro')}</p></Reveal>
      <div className="stats-grid"><CounterCard label={t('home.stats.satellites')} end={430} suffix="+" /><CounterCard label={t('home.stats.schools')} end={1400000} suffix="+" /><CounterCard label={t('home.stats.students')} end={25} suffix="Cr+" /><CounterCard label={t('home.stats.missions')} end={124} suffix="+" /></div><p className="stats-disclaimer">{t('home.stats.disclaimer')}</p>
    </section>
  </div>
}
