/** A compact switch with a visible state and LED for cockpit controls. */
export default function CockpitToggle({ label, state, active, onToggle, ariaLabel, compact = false, title }) {
  return <button
    type="button"
    className={`cockpit-switch ${compact ? 'cockpit-switch--compact' : ''}`}
    role="switch"
    aria-checked={Boolean(active)}
    aria-label={ariaLabel || label}
    title={title || ariaLabel || label}
    onClick={onToggle}
    data-cockpit-sound="click"
  >
    <span className="cockpit-switch-label">{label}</span>
    <span className={`cockpit-switch-led ${active ? 'is-active' : ''}`} aria-hidden="true"><i /></span>
    <span className="cockpit-switch-state">{state}</span>
  </button>
}
