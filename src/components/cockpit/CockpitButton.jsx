import { useRef, useState } from 'react'

/** Reusable keyboard and pointer accessible mission-control button. */
export default function CockpitButton({
  as: Tag = 'button',
  variant = 'scan',
  holdToActivate = false,
  holdDuration = 1000,
  className = '',
  onClick,
  disabled = false,
  children,
  ...props
}) {
  const [holding, setHolding] = useState(false)
  const timer = useRef(null)

  const stopHold = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
    setHolding(false)
  }

  const startHold = event => {
    if (!holdToActivate || disabled || timer.current) return
    if (event?.type === 'keydown' && event.cancelable) event.preventDefault()
    setHolding(true)
    timer.current = window.setTimeout(() => {
      timer.current = null
      setHolding(false)
      onClick?.()
    }, holdDuration)
  }

  return <Tag
    {...props}
    type={Tag === 'button' ? (props.type || 'button') : undefined}
    disabled={disabled}
    className={`cockpit-button cockpit-button--${variant} ${holdToActivate ? 'cockpit-button--hold' : ''} ${className}`.trim()}
    data-holding={holding ? 'true' : undefined}
    data-cockpit-sound={variant === 'ignite' ? 'ignite' : 'click'}
    onPointerDown={holdToActivate ? startHold : undefined}
    onPointerUp={holdToActivate ? stopHold : undefined}
    onPointerCancel={holdToActivate ? stopHold : undefined}
    onPointerLeave={holdToActivate ? stopHold : undefined}
    onKeyDown={holdToActivate ? event => {
      if (event.key === ' ' || event.key === 'Enter') startHold(event)
    } : undefined}
    onKeyUp={holdToActivate ? event => {
      if (event.key === ' ' || event.key === 'Enter') stopHold()
    } : undefined}
    onBlur={holdToActivate ? stopHold : undefined}
    onClick={holdToActivate ? event => event.preventDefault() : onClick}
  >
    {holdToActivate && <svg className="cockpit-hold-ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" /></svg>}
    <span className="cockpit-button-content">{children}</span>
  </Tag>
}
