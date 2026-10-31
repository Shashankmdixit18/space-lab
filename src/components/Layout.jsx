import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSettings } from '../context/SettingsContext'
import GlobalSpaceBackground from './GlobalSpaceBackground'
import CockpitAudio from './cockpit/CockpitAudio'
import './cockpit/cockpit.css'

export default function Layout() {
  const { liteMode } = useSettings()
  const { pathname } = useLocation()
  const suspendBackground = pathname === '/explorer' || pathname.startsWith('/launch')

  return (
    <div
      className="layout-shell flex min-h-screen min-h-[100dvh] flex-col"
      data-lite={liteMode ? 'true' : 'false'}
    >
      <GlobalSpaceBackground suspendWebGL={suspendBackground} />
      <CockpitAudio />
      <div className="layout-content flex min-h-screen min-h-[100dvh] flex-col">
        <Navbar />
        {/* pt-14 offsets the fixed 56px navbar */}
        <main className="flex-1 pt-14">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
