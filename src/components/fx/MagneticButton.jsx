import { useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import './fx.css'

/** A small cursor pull for buttons and links on fine-pointer devices. */
export default function MagneticButton({ as: Tag = 'button', className = '', strength = 12, children, ...props }) {
  const { liteMode } = useSettings()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || liteMode || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = event => {
      const box = el.getBoundingClientRect()
      const x = (event.clientX - box.left - box.width / 2) / box.width
      const y = (event.clientY - box.top - box.height / 2) / box.height
      el.style.transform = `translate3d(${x * strength}px,${y * strength}px,0)`
    }
    const reset = () => { el.style.transform = '' }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', reset)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); reset() }
  }, [liteMode, strength])
  return <Tag ref={ref} className={`fx-magnetic ${className}`} {...props}>{children}</Tag>
}
