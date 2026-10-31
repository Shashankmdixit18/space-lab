import { useRef, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'

/**
 * <Reveal> wraps children in a div that animates in on scroll.
 *
 * Props:
 *   delay     {number}  - GSAP stagger delay in seconds (default 0)
 *   y         {number}  - pixels to slide from (default 40)
 *   duration  {number}  - animation duration seconds (default 0.8)
 *   className {string}  - forwarded to the wrapper div
 *   as        {string}  - wrapper element tag (default 'div')
 */
export default function Reveal({
  children,
  delay = 0,
  y = 40,
  duration = 0.8,
  className = '',
  as: Tag = 'div',
}) {
  const { liteMode } = useSettings()
  const ref = useRef(null)

  useEffect(() => {
    if (liteMode || !ref.current) return

    let ctx
    let active = true

    async function init() {
      const [gsapMod, stMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (!active || !ref.current) return

      const gsap = gsapMod.default
      const { ScrollTrigger } = stMod

      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        )
      }, ref)
    }

    init()

    return () => {
      active = false
      if (ctx) ctx.revert()
    }
  }, [liteMode, delay, y, duration])

  if (liteMode) {
    return (
      <Tag
        ref={ref}
        className={className}
        style={{
          animation: 'liteFadeIn 0.4s ease both',
        }}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ opacity: 0 }} // GSAP will animate this to 1
    >
      {children}
    </Tag>
  )
}
