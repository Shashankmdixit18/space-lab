import { BrowserRouter } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import { StudentProvider } from './context/StudentContext'
import RouteTransition from './components/RouteTransition'
import { useLenis } from './hooks/useLenis'

// Inner app that has access to context
function AppInner() {
  useLenis()
  return (
    <BrowserRouter>
      <RouteTransition />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <StudentProvider>
        <AppInner />
      </StudentProvider>
    </SettingsProvider>
  )
}
