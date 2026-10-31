import { useEffect, useRef, useState } from 'react'
import './launch.css'

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)) }

function useReplay(flight, outcome) {
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState(flight)
  useEffect(() => {
    if (!playing) { setFrame(flight); return undefined }
    const history = outcome?.replayHistory || []
    if (!history.length) { setPlaying(false); return undefined }
    let index = history.length - 1
    setFrame(history[index])
    const timer = setInterval(() => {
      index -= 1
      if (index < 0) { clearInterval(timer); setPlaying(false); return }
      setFrame(history[index])
    }, 420)
    return () => clearInterval(timer)
  }, [playing, outcome, flight])
  return [playing, () => setPlaying(value => !value), frame]
}

export default function LaunchSceneLite({ flight, outcome, throttle, pitch, sceneCopy = {} }) {
  const canvasRef = useRef(null)
  const [camera, setCamera] = useState('chase')
  const [replay, toggleReplay, replayFrame] = useReplay(flight, outcome)
  const activeFlight = replay ? replayFrame : flight

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return undefined
    let raf = 0
    let previous = 0
    let time = 0
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    const draw = now => {
      raf = requestAnimationFrame(draw)
      if (now - previous < 33) return
      previous = now
      time += .035
      canvas.width = canvas.clientWidth * pixelRatio
      canvas.height = canvas.clientHeight * pixelRatio
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const progress = clamp((activeFlight?.altitude || 0) / 800, 0, 1)
      const sky = ctx.createLinearGradient(0, 0, 0, height)
      sky.addColorStop(0, progress > .55 ? '#01040b' : '#3479ac')
      sky.addColorStop(1, progress > .35 ? '#06192b' : '#b5d7ec')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = progress
      ctx.fillStyle = '#fff'
      for (let i = 0; i < 36; i++) ctx.fillRect((i * 97) % width, (i * 53) % height, 1.5, 1.5)
      ctx.globalAlpha = 1
      ctx.fillStyle = '#16385a'
      ctx.beginPath(); ctx.ellipse(width / 2, height + 100, width * .8, 160, 0, Math.PI, 0); ctx.fill()
      ctx.strokeStyle = '#65cfff'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.ellipse(width / 2, height + 100, width * .8, 160, 0, Math.PI, 0); ctx.stroke()
      const y = height * .7 - progress * height * .48
      const x = camera === 'side' ? width * .7 : width / 2
      ctx.save(); ctx.translate(x + Math.sin(time * 10) * 2, y); ctx.rotate((pitch - 90) * Math.PI / 180)
      ctx.fillStyle = '#e7edf4'; ctx.fillRect(-11, -38, 22, 66)
      ctx.fillStyle = '#ec7048'; ctx.beginPath(); ctx.moveTo(-11, -38); ctx.lineTo(0, -60); ctx.lineTo(11, -38); ctx.fill()
      ctx.fillStyle = '#ff7240'; ctx.beginPath(); ctx.moveTo(-11, 16); ctx.lineTo(-18, 29); ctx.lineTo(-5, 23); ctx.moveTo(11, 16); ctx.lineTo(18, 29); ctx.lineTo(5, 23); ctx.fill()
      ctx.fillStyle = '#ffb33c'; ctx.beginPath(); ctx.moveTo(-6, 30); ctx.lineTo(0, 30 + throttle * .4 + Math.sin(time * 18) * 4); ctx.lineTo(6, 30); ctx.fill(); ctx.restore()
      ctx.fillStyle = '#d7e9f4'; ctx.font = '12px sans-serif'
      ctx.fillText(`${sceneCopy.altitude || 'ALTITUDE'} ${Math.round(activeFlight?.altitude || 0)} km · ${activeFlight?.maxQ ? (sceneCopy.phases?.maxq || 'MAX-Q') : (sceneCopy.ascent || 'ASCENT')}`, 18, 28)
      if (outcome?.success) { ctx.fillStyle = '#93f2cf'; ctx.fillText(sceneCopy.orbitAchieved || 'Orbit achieved · payload deployed', 18, 50) }
    }
    draw(0)
    return () => cancelAnimationFrame(raf)
  }, [activeFlight, outcome, throttle, pitch, camera, sceneCopy])

  return <div className="launch-visual-wrap"><canvas ref={canvasRef} className="lite-flight-canvas" /><button className="camera-toggle" onClick={() => setCamera(value => value === 'chase' ? 'side' : 'chase')}>{sceneCopy.camera || 'Camera'}: {camera === 'chase' ? sceneCopy.chase : sceneCopy.side} ↻</button>{outcome?.success && <div className="orbit-achieved">{sceneCopy.orbitAchieved}</div>}{outcome && !outcome.success && <button className="replay-toggle" onClick={toggleReplay}>{replay ? (sceneCopy.replayOn || 'Replay: slow motion ON') : (sceneCopy.replay || '◀ Slow-motion replay')}</button>}</div>
}
