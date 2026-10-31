import { useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import './fx.css'

/** Tilt and light a card toward the pointer on desktop; inert in Lite Mode and touch. */
export default function TiltCard({ as: Tag = 'div', className = '', intensity = 5, children, ...props }) {
  const { liteMode } = useSettings()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || liteMode || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = event => {
      const box = el.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width
      const y = (event.clientY - box.top) / box.height
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * intensity}deg) rotateY(${(x - 0.5) * intensity}deg) translateY(-2px)`
      el.style.setProperty('--fx-glare-x', `${x * 100}%`)
      el.style.setProperty('--fx-glare-y', `${y * 100}%`)
      el.style.setProperty('--fx-glare-opacity', '.9')
    }
    const reset = () => { el.style.transform = ''; el.style.setProperty('--fx-glare-opacity', '0') }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', reset)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); reset() }
  }, [liteMode, intensity])
  return <Tag ref={ref} className={`fx-tilt ${className}`} {...props}>{children}<span className="fx-tilt-glare" aria-hidden="true" /></Tag>
}
