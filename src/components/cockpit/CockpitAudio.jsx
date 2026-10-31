import { useEffect } from 'react'
import { playCockpitSound } from '../../utils/cockpitSound'

/** Global delegated click sounds; muted unless the student enables SFX. */
export default function CockpitAudio() {
  useEffect(() => {
    const handleActivation = event => {
      const control = event.target.closest('button, a, [role="button"], [role="switch"]')
      if (!control) return
      playCockpitSound(control.dataset.cockpitSound || 'click')
    }
    document.addEventListener('click', handleActivation, true)
    return () => document.removeEventListener('click', handleActivation, true)
  }, [])
  return null
}
