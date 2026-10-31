import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import './fx.css'

/** Optional global cursor flourish for desktop fine pointers. */
export default function CustomCursor() {
  const { liteMode } = useSettings()
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setEnabled(finePointer.matches && !liteMode)
    update()
    finePointer.addEventListener?.('change', update)
    return () => finePointer.removeEventListener?.('change', update)
  }, [liteMode])
  useEffect(() => {
    if (!enabled) return
    const cursor = ref.current
    document.documentElement.classList.add('fx-custom-cursor')
    let frame = 0
    let x = -100, y = -100
    const move = event => {
      x = event.clientX; y = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`
        cursor.classList.add('is-visible')
        frame = 0
      })
    }
    const over = event => cursor.classList.toggle('is-hovering', Boolean(event.target.closest('a,button,[role="button"],input[type="submit"]')))
    const leave = () => cursor.classList.remove('is-visible', 'is-hovering')
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerout', over, { passive: true })
    window.addEventListener('blur', leave)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerout', over)
      window.removeEventListener('blur', leave)
      document.documentElement.classList.remove('fx-custom-cursor')
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])
  if (!enabled) return null
  return <div ref={ref} className="fx-cursor" aria-hidden="true"><span className="fx-cursor-ring" /><span className="fx-cursor-dot" /></div>
}
