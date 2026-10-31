/** Native range input with a generous hit area, tick marks, and live fill. */
export default function CockpitSlider({ value, min = 0, max = 100, className = '', ...props }) {
  const progress = Math.max(0, Math.min(100, ((Number(value) - Number(min)) / (Number(max) - Number(min) || 1)) * 100))
  return <span className={`cockpit-slider ${className}`.trim()}>
    <input type="range" min={min} max={max} value={value} style={{ '--range-progress': `${progress}%` }} {...props} />
    <span className="cockpit-slider-ticks" aria-hidden="true" />
  </span>
}
