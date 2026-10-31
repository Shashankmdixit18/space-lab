import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import './global-space-background.css'

const SpaceScene = lazy(() => import('./GlobalSpaceScene'))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function StaticSpace() {
  return <div className="global-space-static" aria-hidden="true" />
}

export default function GlobalSpaceBackground({ suspendWebGL = false }) {
  const { liteMode } = useSettings()
  const [webgl, setWebgl] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWebgl(!liteMode && !suspendWebGL && supportsWebGL()))
    return () => cancelAnimationFrame(frame)
  }, [liteMode, suspendWebGL])

  if (liteMode || suspendWebGL || !webgl) return <StaticSpace />

  return (
    <div className="global-space-background" aria-hidden="true">
      <SceneErrorBoundary fallback={<StaticSpace />}>
        <Suspense fallback={<StaticSpace />}>
          <SpaceScene onFailure={() => setWebgl(false)} />
        </Suspense>
      </SceneErrorBoundary>
      <div className="global-space-vignette" />
      <div className="global-space-grain" />
    </div>
  )
}
