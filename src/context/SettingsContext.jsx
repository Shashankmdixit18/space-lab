import { createContext, useContext, useEffect, useState } from 'react'
import translations from '../data/translations.json'

const SettingsContext = createContext(null)

/**
 * Detects if Lite Mode should be auto-enabled based on device capability.
 * Criteria: small screen OR low CPU cores OR prefers-reduced-motion
 */
function shouldAutoLite() {
  if (typeof window === 'undefined') return false
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const smallScreen = window.innerWidth < 768
  const lowCPU = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4
  return prefersReduced || smallScreen || lowCPU
}

export function SettingsProvider({ children }) {
  const [manualLite, setManualLite] = useState(() => {
    const saved = localStorage.getItem('spacelab_lite')
    return saved === 'true'
  })
  const [autoLite, setAutoLite] = useState(shouldAutoLite)
  const [autoDismissed, setAutoDismissed] = useState(false)
  const liteMode = manualLite || (autoLite && !autoDismissed)

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('spacelab_lang') || 'en'
  })

  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('spacelab_sfx') === 'true')

  useEffect(() => {
    localStorage.setItem('spacelab_lite', manualLite ? 'true' : 'false')
    document.documentElement.setAttribute('data-lite', liteMode ? 'true' : 'false')
  }, [manualLite, liteMode])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => { if (!autoDismissed) setAutoLite(shouldAutoLite()) }
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [autoDismissed])

  useEffect(() => {
    if (liteMode || autoDismissed) return undefined
    let raf = 0; let bucketStart = 0; let frames = 0; let lowBuckets = 0; let warmedAt = 0
    const sample = now => {
      if (!warmedAt) warmedAt = now
      if (!document.hidden) frames += 1
      if (!bucketStart) bucketStart = now
      if (now - bucketStart >= 2000) {
        const fps = frames * 1000 / (now - bucketStart)
        if (now - warmedAt > 2500 && fps < 36) lowBuckets += 1
        else lowBuckets = 0
        if (fps < 24 || lowBuckets >= 2) { setAutoLite(true); return }
        bucketStart = now; frames = 0
      }
      raf = requestAnimationFrame(sample)
    }
    raf = requestAnimationFrame(sample)
    return () => cancelAnimationFrame(raf)
  }, [liteMode, autoDismissed])

  useEffect(() => {
    localStorage.setItem('spacelab_lang', language)
    document.documentElement.setAttribute('lang', language === 'hi' ? 'hi' : 'en')
    document.title = translations[language]?.app?.title || translations.en.app.title
  }, [language])

  useEffect(() => {
    localStorage.setItem('spacelab_sfx', soundEnabled ? 'true' : 'false')
  }, [soundEnabled])

  const toggleLite = () => {
    if (liteMode) { setManualLite(false); setAutoDismissed(true) }
    else { setManualLite(true); setAutoDismissed(false) }
  }
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en')
  const toggleSound = () => setSoundEnabled(prev => !prev)

  return (
    <SettingsContext.Provider value={{ liteMode, toggleLite, language, toggleLanguage, soundEnabled, toggleSound }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
