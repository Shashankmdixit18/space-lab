/** Reusable labeled instrument panel for mission and classroom data. */
export default function HUDPanel({ as: Tag = 'section', code = 'SYS-01', label, className = '', children, ...props }) {
  return <Tag className={`hud-panel ${className}`.trim()} data-hud-code={code} data-hud-label={label} {...props}>
    <span className="hud-panel-tag" aria-hidden="true"><b>{code}</b>{label && <i>{label}</i>}</span>
    {children}
  </Tag>
}
