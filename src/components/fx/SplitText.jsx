import { useSettings } from '../../context/SettingsContext'
import { useGsap } from '../../hooks/useGsap'
import './fx.css'

/** Reveal text word-by-word when it enters the viewport. Use `by="line"` to split explicit newline-separated lines. */
export default function SplitText({ children, by = 'word', as: Tag = 'span', className = '', delay = 0, duration = .55, stagger = .055, ...props }) {
  const { liteMode } = useSettings()
  const text = String(children ?? '')
  const groups = by === 'line' ? text.split('\n') : [text]
  const parts = groups.flatMap((line, lineIndex) => {
    const words = by === 'line' ? [line] : line.split(/\s+/).filter(Boolean)
    return words.map((word, wordIndex) => ({ word, key: `${lineIndex}-${wordIndex}` }))
  })
  const ref = useGsap((gsap, el) => {
    if (liteMode) return
    gsap.fromTo(el.querySelectorAll('.fx-split-word'), { autoAlpha: 0, yPercent: 65, rotateX: -24 }, {
      autoAlpha: 1, yPercent: 0, rotateX: 0, duration, delay, stagger, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  }, [liteMode, duration, delay, stagger])

  return <Tag ref={ref} className={`fx-split-text ${className}`} {...props}>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{by === 'line' ? groups.map((line, index) => <span className="fx-split-word fx-split-line" key={index}>{line || '\u00a0'}</span>) : parts.map((part, index) => <span className="fx-split-word" key={part.key}>{part.word}{index < parts.length - 1 ? '\u00a0' : ''}</span>)}</span>
  </Tag>
}
