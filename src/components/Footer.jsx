import { Link } from 'react-router-dom'
import { useT } from '../hooks/useT'
import SpaceLabBrand from './SpaceLabBrand'

export default function Footer() {
  const { t } = useT()
  const footerLinks = [
    { to: '/', label: t('nav.home') }, { to: '/explorer', label: t('nav.explorer') }, { to: '/launch', label: t('nav.launch') },
    { to: '/quiz', label: t('nav.quiz') }, { to: '/teacher', label: t('nav.teacher') }, { to: '/learn', label: t('nav.learn') }, { to: '/credits', label: t('nav.credits') },
  ]

  return (
    <footer
      className="mt-auto py-8 sm:py-10 px-4 sm:px-8"
      style={{ borderTop: '1px solid rgba(0,212,255,0.1)', background: '#050a14' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 sm:gap-5 text-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center"
          aria-label="SpaceLab home"
        >
          <SpaceLabBrand />
        </Link>

        {/* Nav links — wraps on mobile */}
        <nav
          className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-2"
          aria-label={t('nav.footerLabel')}
        >
          {footerLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-xs sm:text-sm transition-colors duration-200 py-1"
              style={{ color: '#64748b', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e8f4fd')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-16 h-px" style={{ background: 'rgba(0,212,255,0.15)' }} />

        {/* Tagline */}
        <p className="text-xs sm:text-sm max-w-xs sm:max-w-md leading-relaxed" style={{ color: '#64748b' }}>
          {t('footer.tagline')}
        </p>

        {/* Attribution */}
        <p className="text-xs leading-snug max-w-xs" style={{ color: '#3b4a5c' }}>
          {t('footer.built')}
        </p>
        <p className="text-[10px] leading-snug" style={{ color: '#3b4a5c' }}>
          {t('footer.inspiredBy')} <a href="https://ui.watermelon.sh/" target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Watermelon UI</a>
        </p>
        <p className="text-[10px] leading-relaxed max-w-2xl" style={{ color: '#64748b' }}>
          {t('footer.creditsLine')} <Link to="/credits" style={{ color: '#8ca6ba', textDecoration: 'underline', textUnderlineOffset: '3px' }}>{t('nav.credits')}</Link>
        </p>
      </div>
    </footer>
  )
}
