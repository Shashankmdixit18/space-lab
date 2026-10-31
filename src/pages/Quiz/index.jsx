import { useState } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { useT } from '../../hooks/useT'
import { logActivity } from '../../utils/tracker'
import { Counter } from '../../components/fx'
import questionsData from '../../data/questions.json'
import CockpitButton from '../../components/cockpit/CockpitButton'
import HUDPanel from '../../components/cockpit/HUDPanel'
import './quiz.css'

const QUESTION_COUNT = 5

function chooseQuestions() {
  const shuffled = [...questionsData]
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled.slice(0, QUESTION_COUNT)
}

function topicKey(topic) {
  if (topic === 'Rocket Physics') return 'rocketPhysics'
  if (topic === 'ISRO Missions') return 'isroMissions'
  return 'planets'
}

function getBadge(score) {
  if (score === 5) return 'commander'
  if (score >= 3) return 'astronaut'
  return 'cadet'
}

function StarBurst({ liteMode }) {
  return <div className={`quiz-starburst ${liteMode ? 'starburst-lite' : ''}`} aria-hidden="true">
    {!liteMode && Array.from({ length: 24 }, (_, index) => {
      const angle = index * Math.PI * 2 / 24
      const distance = 52 + (index % 3) * 22
      return <i key={index} style={{ '--x': `${Math.cos(angle) * distance}px`, '--y': `${Math.sin(angle) * distance}px`, animationDelay: `${(index % 6) * 35}ms` }} />
    })}
  </div>
}

function Results({ score, liteMode, language, t, onRestart }) {
  const badge = getBadge(score)
  const scoreFormat = new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { maximumFractionDigits: 0 }).format
  return <section className={`quiz-results ${liteMode ? 'results-lite' : ''}`} aria-live="polite">
    <StarBurst liteMode={liteMode} />
    <span className="quiz-results-kicker">{t('quiz.resultsKicker')}</span>
    <h2>{t('quiz.resultsTitle')}</h2>
    <div className="quiz-score"><Counter value={score} duration={1.4} format={scoreFormat} /> <span>/ {QUESTION_COUNT}</span></div>
    <p className="quiz-score-label">{t('quiz.scoreLabel')}</p>
    <div className="quiz-badge" key={badge}>
      <span className="quiz-badge-icon" aria-hidden="true">{badge === 'commander' ? '✦' : badge === 'astronaut' ? '🚀' : '✧'}</span>
      <span className="quiz-badge-label">{t(`quiz.badges.${badge}`)}</span>
      <span className="quiz-badge-description">{t(`quiz.badgeDescriptions.${badge}`)}</span>
    </div>
    <CockpitButton type="button" variant="scan" className="quiz-restart" onClick={onRestart}>{t('quiz.tryAgain')} <span aria-hidden="true">↻</span></CockpitButton>
  </section>
}

export default function Quiz() {
  const { liteMode } = useSettings()
  const { t, language } = useT()
  const [questions, setQuestions] = useState(chooseQuestions)
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const complete = index >= questions.length
  const question = questions[index]
  const questionText = question && question[`question_${language}`]
  const options = question && question[`options_${language}`]
  const explanation = question && question[`explanation_${language}`]
  const progress = complete ? 100 : ((index + (answered ? 1 : 0)) / QUESTION_COUNT) * 100

  const answer = optionIndex => {
    if (answered || !question) return
    const isCorrect = optionIndex === question.correct_index
    setChoice(optionIndex)
    setAnswered(true)
    if (isCorrect) setScore(current => current + 1)
    logActivity('quiz', question.topic, isCorrect ? 1 : 0)
  }

  const advance = () => {
    if (!answered) return
    setIndex(current => current + 1)
    setChoice(null)
    setAnswered(false)
  }

  const restart = () => {
    setQuestions(chooseQuestions())
    setIndex(0)
    setChoice(null)
    setScore(0)
    setAnswered(false)
  }

  return <main className={`quiz-page ${liteMode ? 'quiz-lite' : ''}`}>
    <header className="quiz-heading">
      <span>{t('quiz.kicker')}</span>
      <h1>{t('pages.quiz.title')}</h1>
      <p>{t('quiz.intro')}</p>
    </header>

    <HUDPanel as="section" code="SYS-03" label={t('quiz.title')} className={`quiz-shell ${liteMode ? '' : 'hud-flicker'}`} aria-label={t('quiz.title')}>
      <div className="quiz-progress-top">
        <span>{complete ? t('quiz.complete') : t('quiz.questionOf', { current: index + 1, total: QUESTION_COUNT })}</span>
        <span>{score} {t('quiz.points')}</span>
      </div>
      <div className="quiz-progress-track" role="progressbar" aria-label={t('quiz.progress')} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </div>

      {complete
        ? <Results score={score} liteMode={liteMode} language={language} t={t} onRestart={restart} />
        : <article className={`quiz-card ${answered ? (choice === question.correct_index ? 'quiz-card-correct' : 'quiz-card-wrong') : ''}`} key={question.id}>
          <div className="quiz-question-meta"><span>{t('quiz.questionLabel')} {String(index + 1).padStart(2, '0')}</span><span>{t(`quiz.topics.${topicKey(question.topic)}`)}</span></div>
          <h2>{questionText}</h2>
          <div className="quiz-options" role="group" aria-label={t('quiz.answerOptions')}>
            {options.map((option, optionIndex) => {
              const isAnswer = optionIndex === question.correct_index
              const isChosen = choice === optionIndex
              let stateClass = ''
              if (answered && isAnswer) stateClass = 'option-correct'
              else if (answered && isChosen) stateClass = 'option-wrong'
              return <button type="button" className={`quiz-option cockpit-answer-button ${stateClass}`} key={`${question.id}-${optionIndex}`} onClick={() => answer(optionIndex)} disabled={answered} aria-pressed={isChosen} data-cockpit-sound="click">
                <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className="quiz-option-text">{option}</span>
                {answered && isAnswer && <span className="quiz-option-mark" aria-hidden="true">✓</span>}
                {answered && isChosen && !isAnswer && <span className="quiz-option-mark" aria-hidden="true">×</span>}
              </button>
            })}
          </div>
          {answered && <div className={`quiz-feedback ${choice === question.correct_index ? 'feedback-correct' : 'feedback-wrong'}`} role="status">
            <strong>{choice === question.correct_index ? t('quiz.correct') : t('quiz.notQuite')}</strong>
            <p>{explanation}</p>
          </div>}
          {answered && <CockpitButton type="button" variant="ignite" className="quiz-next" onClick={advance}>{index === QUESTION_COUNT - 1 ? t('quiz.seeResults') : t('quiz.next')} <span aria-hidden="true">→</span></CockpitButton>}
        </article>}
    </HUDPanel>
  </main>
}
