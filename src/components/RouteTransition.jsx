import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useT } from '../hooks/useT'
import Layout from './Layout'
import './route-transition.css'

const Home = lazy(() => import('../pages/Home'))
const Explorer = lazy(() => import('../pages/Explorer'))
const Launch = lazy(() => import('../pages/Launch'))
const Quiz = lazy(() => import('../pages/Quiz'))
const Teacher = lazy(() => import('../pages/Teacher'))
const LearnHub = lazy(() => import('../pages/Learn'))
const Credits = lazy(() => import('../pages/Credits'))

function RoutePageFallback() {
  const { t } = useT()
  return <div className="route-page-loading" role="status">{t('app.loading')}</div>
}

function LazyPage({ children }) {
  return <Suspense fallback={<RoutePageFallback />}>{children}</Suspense>
}

export default function RouteTransition() {
  const location = useLocation()
  const { liteMode } = useSettings()
  const liteRef = useRef(liteMode)
  const [shownLocation, setShownLocation] = useState(location)
  const shownRef = useRef(location)
  const pendingRef = useRef(location)
  const panelRef = useRef(null)

  useLayoutEffect(() => { liteRef.current = liteMode }, [liteMode])

  useLayoutEffect(() => {
    pendingRef.current = location
    if (location.key === shownRef.current.key) return undefined
    const transitionLite = liteRef.current
    const panel = panelRef.current
    if (!panel) return undefined

    let active = true
    let swapped = false
    let gsap
    let ScrollTrigger
    let timeline
    let refreshFrameOne = 0
    let refreshFrameTwo = 0

    const swapRoute = () => {
      if (!active || swapped) return
      swapped = true
      const nextLocation = pendingRef.current
      shownRef.current = nextLocation
      setShownLocation(nextLocation)
      window.dispatchEvent(new Event('spacelab:scroll-reset'))
      window.scrollTo(0, 0)
      refreshFrameOne = requestAnimationFrame(() => {
        refreshFrameTwo = requestAnimationFrame(() => { if (active) ScrollTrigger?.refresh() })
      })
    }

    async function startTransition() {
      const [gsapModule, triggerModule] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (!active || !panel) return
      gsap = gsapModule.default
      ScrollTrigger = triggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)
      gsap.killTweensOf(panel)
      gsap.set(panel, { display: 'block', pointerEvents: 'auto', opacity: transitionLite ? 0 : 1, scaleX: transitionLite ? 1 : 0, transformOrigin: 'left center' })

      const finish = () => {
        if (!active) return
        gsap.set(panel, { display: 'none', pointerEvents: 'none', clearProps: 'opacity,transform,transformOrigin' })
        ScrollTrigger.refresh()
      }
      timeline = gsap.timeline({ onComplete: finish })
      if (transitionLite) {
        timeline.to(panel, { opacity: 1, duration: .12, ease: 'power1.out' })
        timeline.call(swapRoute)
        timeline.to(panel, { opacity: 0, duration: .2, ease: 'power1.inOut' })
      } else {
        timeline.to(panel, { scaleX: 1, duration: .26, ease: 'power2.inOut' })
        timeline.call(swapRoute)
        timeline.set(panel, { transformOrigin: 'right center' })
        timeline.to(panel, { scaleX: 0, duration: .32, ease: 'power2.inOut' })
      }
    }

    startTransition()
    return () => {
      active = false
      timeline?.kill()
      if (gsap && panel) gsap.killTweensOf(panel)
      cancelAnimationFrame(refreshFrameOne)
      cancelAnimationFrame(refreshFrameTwo)
    }
  }, [location])

  return <>
    <div className={`route-wipe ${liteMode ? 'route-wipe-lite' : ''}`} ref={panelRef} aria-hidden="true">
      {!liteMode && <div className="route-wipe-stars"><i /><i /><i /><i /><i /><i /><i /></div>}
      <span className="route-wipe-mark">✦</span>
    </div>
    <Routes location={shownLocation}>
      <Route element={<Layout />}>
        <Route index element={<LazyPage><Home /></LazyPage>} />
        <Route path="explorer" element={<LazyPage><Explorer /></LazyPage>} />
        <Route path="launch" element={<LazyPage><Launch /></LazyPage>} />
        <Route path="quiz" element={<LazyPage><Quiz /></LazyPage>} />
        <Route path="teacher" element={<LazyPage><Teacher /></LazyPage>} />
        <Route path="credits" element={<LazyPage><Credits /></LazyPage>} />
        <Route path="learn/*" element={<LazyPage><LearnHub /></LazyPage>} />
        <Route path="*" element={<LazyPage><Home /></LazyPage>} />
      </Route>
    </Routes>
  </>
}
