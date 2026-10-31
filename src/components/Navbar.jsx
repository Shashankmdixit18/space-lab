import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useStudent } from '../context/StudentContext'
import { useT } from '../hooks/useT'
import CockpitToggle from './cockpit/CockpitToggle'
import SpaceLabBrand from './SpaceLabBrand'

export default function Navbar() {
  const { liteMode, toggleLite, toggleLanguage, language, soundEnabled, toggleSound } = useSettings()
  const { student } = useStudent()
  const { t } = useT()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [menuOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = [
    { to: '/', label: t('nav.home'), icon: '🏠' }, { to: '/explorer', label: t('nav.explorer'), icon: '🪐' },
    { to: '/learn', label: language === 'hi' ? 'सीखें' : 'Learn', icon: '📚' },
    { to: '/launch', label: t('nav.launch'), icon: '🚀' }, { to: '/quiz', label: t('nav.quiz'), icon: '⭐' },
    { to: '/teacher', label: t('nav.teacher'), icon: '📊' },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14"
        style={{
          background: 'rgba(5,10,20,0.9)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(0,212,255,0.12)',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center shrink-0"
          aria-label="SpaceLab home"
        >
          <SpaceLabBrand compact />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label={t('nav.mainLabel')}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.1)]'
                    : 'text-[#64748b] hover:text-[#e8f4fd] hover:bg-[rgba(255,255,255,0.05)]'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Student identity — compact two-line badge on wide screens */}
          {student && (
            <span
              className="hidden xl:flex max-w-[220px] min-w-[150px] flex-col gap-0.5 rounded-xl border border-[rgba(0,212,255,0.3)] px-3 py-1 text-[#00d4ff] leading-tight"
              title={t('nav.greeting', { name: student.name, code: student.classCode })}
              aria-label={t('nav.greeting', { name: student.name, code: student.classCode })}
            >
              <span className="max-w-full truncate text-xs font-medium">{t('nav.studentName', { name: student.name })}</span>
              <span className="whitespace-nowrap text-[10px] text-[#8bb8c8]">{t('nav.studentClass', { code: student.classCode })}</span>
            </span>
          )}

          {/* Language toggle */}
          <CockpitToggle compact label={t('settings.language')} state={language.toUpperCase()} active={language === 'hi'} onToggle={toggleLanguage} ariaLabel={t('nav.toggleLanguage')} />

          {/* Lite mode toggle — hide label on very small screens */}
          <CockpitToggle compact label="LITE" state={liteMode ? 'ON' : 'OFF'} active={liteMode} onToggle={toggleLite} ariaLabel={t('nav.toggleLiteMode')} title={liteMode ? t('settings.disableLite') : t('settings.enableLite')} />
          <CockpitToggle compact label="SFX" state={soundEnabled ? 'ON' : 'OFF'} active={soundEnabled} onToggle={toggleSound} ariaLabel={t('nav.toggleSound')} title={soundEnabled ? t('settings.soundOn') : t('settings.soundOff')} />

          {/* Hamburger — mobile/tablet only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="cockpit-button cockpit-button--icon lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-md transition-colors"
            style={{ color: '#e8f4fd' }}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                background: '#e8f4fd',
                transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: '#e8f4fd',
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300 origin-center"
              style={{
                background: '#e8f4fd',
                transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
        style={{
          background: 'rgba(5,10,20,0.7)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 bottom-0 z-50 lg:hidden flex flex-col"
        style={{
          width: 'min(80vw, 300px)',
          background: 'rgba(10,22,40,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(0,212,255,0.15)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: menuOpen ? '-8px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}
        >
          <SpaceLabBrand compact />
          <button type="button" onClick={() => setMenuOpen(false)} className="cockpit-button cockpit-button--icon w-11 h-11 flex items-center justify-center text-lg" aria-label={t('nav.closeMenu')}>✕</button>
        </div>

        {/* Student greeting inside drawer */}
        {student && (
          <div
            className="mx-5 mt-4 flex flex-col gap-1 rounded-lg px-3 py-2 text-xs leading-tight"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff',
            }}
            aria-label={t('nav.greeting', { name: student.name, code: student.classCode })}
          >
            <span className="break-words font-medium">{t('nav.studentName', { name: student.name })}</span>
            <span className="text-[11px] text-[#8bb8c8]">{t('nav.studentClass', { code: student.classCode })}</span>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 mt-4 flex-1" aria-label={t('nav.mobileLabel')}>
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.12)]'
                    : 'text-[#94a3b8] hover:text-[#e8f4fd] hover:bg-[rgba(255,255,255,0.05)]'
                }`
              }
            >
              <span className="text-base w-6 text-center" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls in drawer */}
        <div
          className="px-5 py-5 flex flex-col gap-3 shrink-0"
          style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}
        >
          <CockpitToggle label={t('settings.language')} state={language.toUpperCase()} active={language === 'hi'} onToggle={toggleLanguage} ariaLabel={t('nav.toggleLanguage')} />
          <CockpitToggle label="LITE" state={liteMode ? t('settings.liteOn') : t('settings.liteOff')} active={liteMode} onToggle={toggleLite} ariaLabel={t('nav.toggleLiteMode')} />
          <CockpitToggle label="SFX" state={soundEnabled ? t('settings.soundOn') : t('settings.soundOff')} active={soundEnabled} onToggle={toggleSound} ariaLabel={t('nav.toggleSound')} />
        </div>
      </div>
    </>
  )
}
