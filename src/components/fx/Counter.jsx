import { useRef } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { useGsap } from '../../hooks/useGsap'
import './fx.css'

const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

/** Count from zero to `value` when scrolled into view. Lite Mode shows the final value immediately. */
export default function Counter({ value, from = 0, prefix = '', suffix = '', duration = 1.8, className = '', format = numberFormat.format, ...props }) {
  const { liteMode } = useSettings()
  const ref = useRef(null)
  const display = `${prefix}${format(value)}${suffix}`
  useGsap((gsap, el) => {
    if (liteMode) return
    const counter = { value: from }
    gsap.to(counter, { value, duration, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = `${prefix}${format(counter.value)}${suffix}` } })
  }, [liteMode, value, from, prefix, suffix, duration, format])
  return <span ref={ref} className={className} aria-label={display} {...props}>{display}</span>
}
