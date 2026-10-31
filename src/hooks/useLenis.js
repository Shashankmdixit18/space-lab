import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'

/**
 * Initialises Lenis smooth scroll and wires it to GSAP ScrollTrigger.
 * Disabled in Lite Mode. Fully cleaned up on unmount or liteMode change.
 */
export function useLenis() {
  const { liteMode } = useSettings()

  useEffect(() => {
    if (liteMode) return

    let lenis
    let rafId
    let cancelled = false
    let resetScroll
    let onLenisScroll

    async function init() {
      const [{ default: Lenis }, gsapMod] = await Promise.all([
        import('lenis'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      const { ScrollTrigger } = gsapMod

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      resetScroll = () => lenis?.scrollTo(0, { immediate: true })
      window.addEventListener('spacelab:scroll-reset', resetScroll)

      // Keep GSAP ScrollTrigger in sync with Lenis scroll position
      onLenisScroll = () => ScrollTrigger.update()
      lenis.on('scroll', onLenisScroll)

      function raf(time) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)

    }

    init()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      if (resetScroll) window.removeEventListener('spacelab:scroll-reset', resetScroll)
      if (lenis) {
        if (onLenisScroll) lenis.off('scroll', onLenisScroll)
        lenis.destroy()
      }
    }
  }, [liteMode])
}
