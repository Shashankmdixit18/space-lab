import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { useT } from '../../hooks/useT'

export default function HeroText() {
  const { liteMode } = useSettings()
  const { t, language } = useT()
  const containerRef = useRef(null)

  const headline = t('hero.headline')
  const subtext = t('hero.subtext')
  const cta = t('hero.cta')

  useEffect(() => {
    if (liteMode || !containerRef.current) return
    let ctx
    let active = true
    async function animate() {
      const gsapMod = await import('gsap')
      if (!active || !containerRef.current) return
      const gsap = gsapMod.default

      const words = containerRef.current.querySelectorAll('.hero-word')
      const sub = containerRef.current.querySelector('.hero-sub')
      const btn = containerRef.current.querySelector('.hero-cta')

      ctx = gsap.context(() => {
        gsap.fromTo(
          words,
          { opacity: 0, y: 36, rotateX: -18 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.65, ease: 'power3.out', stagger: 0.065, delay: 0.3 }
        )
        gsap.fromTo(sub, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.85 })
        gsap.fromTo(btn, { opacity: 0, y: 14, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)', delay: 1.1 })
      }, containerRef)
    }
    animate()
    return () => { active = false; if (ctx) ctx.revert() }
  }, [liteMode, language])

  const words = headline.split(' ')

  return (
    <div
      ref={containerRef}
      className="hero-copy relative z-10 flex flex-col justify-center h-full px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-16 pb-12"
      style={{ perspective: '800px', maxWidth: '640px' }}
    >
      <h1
        className="font-bold leading-tight mb-4 sm:mb-5"
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: '#e8f4fd',
          fontSize: 'clamp(1.75rem, 6vw, 3.75rem)',
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            className="hero-word inline-block mr-[0.2em]"
            style={{ marginRight: '0.2em', ...(liteMode ? {} : { opacity: 0 }) }}
          >
            {word}
          </span>
        ))}
      </h1>

      <p
        className="hero-sub text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed"
        style={{ color: '#8da8c4', opacity: liteMode ? 1 : 0, maxWidth: '36ch' }}
      >
        {subtext}
      </p>

      <Link
        to="/explorer"
        className="hero-cta cockpit-button cockpit-button--ignite inline-flex items-center gap-2 self-start px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #00d4ff 0%, #0066cc 100%)',
          color: '#050a14',
          opacity: liteMode ? 1 : 0,
          boxShadow: '0 0 24px rgba(0,212,255,0.4)',
          fontFamily: 'Space Grotesk, sans-serif',
          minHeight: '44px',
        }}
        onMouseEnter={e => {
          if (liteMode) return
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
          e.currentTarget.style.boxShadow = '0 0 36px rgba(0,212,255,0.6)'
        }}
        onMouseLeave={e => {
          if (liteMode) return
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = '0 0 24px rgba(0,212,255,0.4)'
        }}
      >
        🪐 {cta}
      </Link>
    </div>
  )
}
