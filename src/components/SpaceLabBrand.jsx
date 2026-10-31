import { useId } from 'react'
import './space-lab-brand.css'

/** Shared SpaceLab orbital monogram and wordmark. */
export default function SpaceLabBrand({ compact = false }) {
  const gradientId = `space-lab-core-${useId().replace(/:/g, '')}`
  return (
    <span className={`space-lab-brand${compact ? ' space-lab-brand--compact' : ''}`}>
      <svg className="space-lab-brand__mark" viewBox="0 0 44 44" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="9" y1="7" x2="34" y2="39" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8CF4FF" />
            <stop offset=".52" stopColor="#36BDEB" />
            <stop offset="1" stopColor="#7766FF" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r="19.2" fill="#091827" stroke="rgba(108,218,255,.18)" />
        <path d="M6.4 27.4c4.3 6.7 13 10 21 7.1 6.4-2.4 10.6-8.6 10.6-15.2" fill="none" stroke="#46D8F4" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M37.6 16.7C33.5 9.4 24.8 6 16.7 8.9 10.5 11.1 6.4 16.7 6 23" fill="none" stroke="#9787FF" strokeWidth="1.55" strokeLinecap="round" opacity=".9" />
        <circle cx="22" cy="21.5" r="9.1" fill={`url(#${gradientId})`} />
        <path d="M17.3 25.5c1.1-2.7 3.2-4.1 6.1-4.2 1.9-.1 3.2-.9 3.2-2.3 0-1.3-1.1-2.1-3.2-2.1-1.4 0-2.8.4-4.1 1.2" fill="none" stroke="#071322" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="37.7" cy="16.7" r="2.25" fill="#F2FCFF" />
        <path d="M8.8 11.9v3.8M6.9 13.8h3.8" stroke="#E8F9FF" strokeWidth=".9" strokeLinecap="round" opacity=".85" />
      </svg>
      <span className="space-lab-brand__type">
        <span className="space-lab-brand__name"><span>space</span><b>lab</b></span>
        {!compact && <span className="space-lab-brand__tagline">EXPLORE · LEARN · BUILD</span>}
      </span>
    </span>
  )
}
