let audioContext

/** Play tiny UI sounds only after explicit opt-in and a user gesture. */
export function playCockpitSound(kind = 'click') {
  try {
    if (localStorage.getItem('spacelab_sfx') !== 'true') return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    audioContext ||= new AudioContextClass()
    if (audioContext.state === 'suspended') audioContext.resume()

    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    if (kind === 'ignite') {
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(120, now)
      oscillator.frequency.exponentialRampToValueAtTime(48, now + 0.42)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.035)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.46)
      oscillator.start(now)
      oscillator.stop(now + 0.48)
    } else {
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(620, now)
      oscillator.frequency.exponentialRampToValueAtTime(390, now + 0.035)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.025, now + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
      oscillator.start(now)
      oscillator.stop(now + 0.055)
    }
  } catch {
    // Audio is optional; unsupported or blocked playback never interrupts UI.
  }
}
