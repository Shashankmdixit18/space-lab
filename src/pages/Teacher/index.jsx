import { lazy, Suspense, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import HUDPanel from '../../components/cockpit/HUDPanel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Counter } from '../../components/fx'
import { useSettings } from '../../context/SettingsContext'
import demoData from '../../data/demo-class.json'
import { useT } from '../../hooks/useT'
import { getClassData } from '../../utils/tracker'
import './teacher.css'

const TopicChart = lazy(() => import('./TopicChart'))

const TOPICS = ['Planets', 'Rocket Physics', 'ISRO Missions']
const normalizeName = name => String(name || '').trim().toLocaleLowerCase()
const number = value => Number.isFinite(value) ? value : 0

function buildClassData(classCode, activities) {
  const demoClass = demoData.classes.find(item => item.classCode.toUpperCase() === classCode)
  const students = new Map((demoClass?.students || []).map(student => [normalizeName(student.name), {
    ...student,
    quiz_scores: { ...student.quiz_scores },
    activityCount: number(student.launch_attempts) + number(student.planets_explored),
    localActivities: [],
  }]))

  activities.forEach((activity, index) => {
    const name = String(activity.studentName || '').trim()
    if (!name) return
    const key = normalizeName(name)
    if (!students.has(key)) students.set(key, {
      id: `local-${key}-${index}`, name, status: 'active', profile: 'local', quiz_scores: {},
      launch_attempts: 0, successful_launches: 0, planets_explored: 0, activityCount: 0, localActivities: [],
    })
    const student = students.get(key)
    student.localActivities.push(activity)
    student.activityCount += 1
    student.status = 'active'
    if (activity.type === 'launch') {
      student.launch_attempts += 1
      if (activity.result === 'success') student.successful_launches += 1
    }
    if (activity.type === 'planet') student.planets_explored += 1
  })

  const rows = [...students.values()].map(student => {
    TOPICS.forEach(topic => {
      const attempts = student.localActivities.filter(item => item.type === 'quiz' && item.topic === topic)
      if (attempts.length) student.quiz_scores[topic] = attempts.filter(item => Number(item.result) === 1).length / attempts.length * 100
    })
    const scores = TOPICS.map(topic => student.quiz_scores[topic]).filter(value => Number.isFinite(value))
    const averageScore = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null
    const lastActivity = student.localActivities.reduce((latest, item) => Math.max(latest, Number(item.timestamp) || 0), 0)
    const isInactive = student.status === 'inactive' && student.activityCount === 0 && scores.length === 0
    const status = isInactive ? 'inactive' : averageScore !== null && averageScore >= 70 ? 'doingWell' : 'needsHelp'
    return {
      ...student,
      averageScore,
      status,
      planets_explored: Math.min(8, student.planets_explored),
      lastActivity,
    }
  })
  return { rows, isDemoData: Boolean(demoClass) }
}

function getCsvValue(value) {
  let safe = String(value ?? '')
  if (/^[=+\-@]/.test(safe)) safe = `'${safe}`
  return `"${safe.replaceAll('"', '""')}"`
}

export default function Teacher() {
  const { t, language } = useT()
  const { liteMode } = useSettings()
  const [classCode, setClassCode] = useState('')
  const [loadedClass, setLoadedClass] = useState(null)
  const [message, setMessage] = useState('')
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' })
  const scoreFormatter = useMemo(() => new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { maximumFractionDigits: 1 }).format, [language])

  const loadClass = event => {
    event.preventDefault()
    const code = classCode.trim().toUpperCase()
    setClassCode(code)
    if (!code) {
      setLoadedClass(null)
      setMessage(t('teacher.enterCode'))
      return
    }
    const activities = getClassData(code)
    const result = buildClassData(code, activities)
    if (!result.isDemoData && activities.length === 0) {
      setLoadedClass(null)
      setMessage(t('teacher.unknownCode', { code }))
      return
    }
    setLoadedClass({ code, ...result, activityCount: activities.length, activities })
    setMessage('')
  }

  const metrics = useMemo(() => {
    if (!loadedClass) return null
    const { rows } = loadedClass
    const scoreRows = rows.filter(row => row.averageScore !== null)
    const averageScore = scoreRows.length ? scoreRows.reduce((sum, row) => sum + row.averageScore, 0) / scoreRows.length : null
    const totalLaunches = rows.reduce((sum, row) => sum + number(row.launch_attempts), 0)
    const activeStudent = [...rows].sort((a, b) => b.activityCount - a.activityCount)[0]
    const topics = TOPICS.map(topic => {
      const values = rows.map(row => row.quiz_scores[topic]).filter(value => Number.isFinite(value))
      return { topic, score: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null }
    })
    const ratedTopics = topics.filter(item => item.score !== null)
    const weakest = ratedTopics.length ? ratedTopics.reduce((low, item) => item.score < low.score ? item : low) : null
    return { totalStudents: rows.length, averageScore, totalLaunches, activeStudent, topics, weakest }
  }, [loadedClass])

  const mostRead = useMemo(() => {
    const counts = new Map()
    ;(loadedClass?.activities || []).filter(activity => activity.type === 'learn' && activity.result === 'read').forEach(activity => counts.set(activity.topic, (counts.get(activity.topic) || 0) + 1))
    return [...counts].map(([topic, reads]) => ({ topic, reads })).sort((a, b) => b.reads - a.reads).slice(0, 5)
  }, [loadedClass])

  const sortedRows = useMemo(() => {
    if (!loadedClass) return []
    const direction = sort.direction === 'asc' ? 1 : -1
    return [...loadedClass.rows].sort((a, b) => {
      const topic = sort.key.startsWith('topic:') ? sort.key.slice(6) : null
      const first = topic ? a.quiz_scores[topic] : a[sort.key]
      const second = topic ? b.quiz_scores[topic] : b[sort.key]
      if (first == null) return second == null ? 0 : 1
      if (second == null) return -1
      return (typeof first === 'string' ? first.localeCompare(second, language) : first - second) * direction
    })
  }, [loadedClass, sort, language])

  const formatScore = value => value === null || value === undefined ? '—' : `${new Intl.NumberFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { maximumFractionDigits: 1 }).format(value)}%`
  const formatDate = timestamp => timestamp ? new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp) : '—'
  const toggleSort = key => setSort(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))

  const exportReport = () => {
    if (!loadedClass) return
    const headings = [t('teacher.columnStudent'), t('teacher.columnStatus'), t('teacher.columnAverageScore'), ...TOPICS.map(topic => t(`teacher.topicNames.${topicKey(topic)}`)), t('teacher.columnLaunches'), t('teacher.columnSuccessfulLaunches'), t('teacher.columnPlanetsExplored'), t('teacher.columnLastActivity')]
    const records = sortedRows.map(row => [row.name, t(`teacher.statusTags.${row.status}`), row.averageScore === null ? '' : row.averageScore.toFixed(1), ...TOPICS.map(topic => row.quiz_scores[topic] ?? ''), row.launch_attempts, row.successful_launches, row.planets_explored, formatDate(row.lastActivity)])
    const csv = [headings, ...records].map(line => line.map(getCsvValue).join(',')).join('\r\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `spacelab_${loadedClass.code.toLowerCase()}_report.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const topicKey = topic => topic === 'Rocket Physics' ? 'rocketPhysics' : topic === 'ISRO Missions' ? 'isroMissions' : 'planets'
  const columns = [
    ['name', 'columnStudent'], ['status', 'columnStatus'], ['averageScore', 'columnAverageScore'],
    ['topic:Planets', 'topicPlanets'], ['topic:Rocket Physics', 'topicRocketPhysics'], ['topic:ISRO Missions', 'topicIsroMissions'],
    ['launch_attempts', 'columnLaunches'], ['successful_launches', 'columnSuccessfulLaunches'], ['planets_explored', 'columnPlanetsExplored'], ['lastActivity', 'columnLastActivity'],
  ]

  return <main className="teacher-dashboard">
    <header className="teacher-heading">
      <div>
        <div className="teacher-eyebrow">{t('teacher.eyebrow')}</div>
        <h1>{t('teacher.title')}</h1>
        <p>{t('teacher.description')}</p>
      </div>
      <span className="teacher-status"><span /> {t('teacher.status')}</span>
    </header>

    <HUDPanel as={Card} code="SYS-06" label={t('teacher.lookupTitle')} className="teacher-class-search hud-flicker">
      <CardHeader className="teacher-search-header"><CardTitle>{t('teacher.lookupTitle')}</CardTitle></CardHeader>
      <CardContent>
        <form className="teacher-search-form" onSubmit={loadClass}>
          <label htmlFor="teacher-class-code">{t('teacher.classCodeLabel')}</label>
          <input id="teacher-class-code" value={classCode} onChange={event => setClassCode(event.target.value.toUpperCase())} placeholder={t('teacher.classCodePlaceholder')} autoCapitalize="characters" autoComplete="off" />
          <Button type="submit" className="cockpit-button cockpit-button--ignite teacher-search-button">{t('teacher.loadClass')}</Button>
        </form>
        {message && <p className="teacher-lookup-message" role="status">{message}</p>}
      </CardContent>
    </HUDPanel>

    {!loadedClass && !message && <p className="teacher-empty-prompt">{t('teacher.enterPrompt')}</p>}

    {loadedClass && metrics && <>
      {loadedClass.isDemoData && <div className="teacher-demo-note">{t('teacher.demoNote')}</div>}
      <section className="teacher-summary" aria-label={t('teacher.summaryLabel')}>
        <HUDPanel as={Card} code="SYS-07" label={t('teacher.totalStudents')} className="teacher-stat-card" style={{ '--stat-delay': '0ms' }}>
          <CardContent className="teacher-stat-content"><span className="teacher-stat-icon" aria-hidden="true">👩‍🚀</span><Counter className="teacher-stat-value" value={metrics.totalStudents} duration={1.15} /><span className="teacher-stat-label">{t('teacher.totalStudents')}</span><span className="teacher-stat-detail">{t('teacher.studentCountDetail')}</span></CardContent>
        </HUDPanel>
        <HUDPanel as={Card} code="SYS-08" label={t('teacher.averageScore')} className="teacher-stat-card" style={{ '--stat-delay': '90ms' }}>
          <CardContent className="teacher-stat-content"><span className="teacher-stat-icon" aria-hidden="true">📈</span>{metrics.averageScore === null ? <span className="teacher-stat-value">—</span> : <Counter className="teacher-stat-value" value={metrics.averageScore} duration={1.25} suffix="%" format={scoreFormatter} />}<span className="teacher-stat-label">{t('teacher.averageScore')}</span><span className="teacher-stat-detail">{t('teacher.acrossTopics')}</span></CardContent>
        </HUDPanel>
        <HUDPanel as={Card} code="SYS-09" label={t('teacher.totalLaunches')} className="teacher-stat-card" style={{ '--stat-delay': '180ms' }}>
          <CardContent className="teacher-stat-content"><span className="teacher-stat-icon" aria-hidden="true">🚀</span><Counter className="teacher-stat-value" value={metrics.totalLaunches} duration={1.35} /><span className="teacher-stat-label">{t('teacher.totalLaunches')}</span><span className="teacher-stat-detail">{t('teacher.launchesDetail')}</span></CardContent>
        </HUDPanel>
        <HUDPanel as={Card} code="SYS-10" label={t('teacher.mostActiveStudent')} className="teacher-stat-card teacher-active-stat" style={{ '--stat-delay': '270ms' }}>
          <CardContent className="teacher-stat-content"><span className="teacher-stat-icon" aria-hidden="true">🌟</span><Counter className="teacher-stat-value" value={metrics.activeStudent?.activityCount || 0} duration={1.45} /><span className="teacher-stat-label">{t('teacher.mostActiveStudent')}</span><span className="teacher-stat-detail" title={metrics.activeStudent?.name}>{metrics.activeStudent?.name || t('teacher.noActivity')}</span></CardContent>
        </HUDPanel>
      </section>

      <HUDPanel as={Card} code="SYS-LEARN" label={language === 'hi' ? 'सबसे अधिक पढ़े गए विषय' : 'Most-read topics'} className="teacher-learn-card hud-flicker">
        <CardHeader className="teacher-card-header"><CardTitle>{language === 'hi' ? 'सबसे अधिक पढ़े गए विषय' : 'Most-read topics'}</CardTitle></CardHeader>
        <CardContent className="teacher-learn-list">{mostRead.length ? mostRead.map(item => <div key={item.topic}><span>{item.topic}</span><b>{item.reads} {language === 'hi' ? 'पठन' : 'reads'}</b></div>) : <p>{language === 'hi' ? 'इस कक्षा के पढ़ने के रिकॉर्ड अभी उपलब्ध नहीं हैं।' : 'No Knowledge Hub reads have been recorded for this class yet.'}</p>}</CardContent>
      </HUDPanel>

      <div className="teacher-insights-grid">
        <HUDPanel as={Card} code="SYS-11" label={t('teacher.topicScoresTitle')} className="teacher-chart-card hud-flicker">
          <CardHeader className="teacher-card-header"><CardTitle>{t('teacher.topicScoresTitle')}</CardTitle></CardHeader>
          <CardContent>
            {metrics.topics.some(item => item.score !== null) ? <Suspense fallback={<div className="teacher-chart-loading">{t('teacher.chartLoading')}</div>}><TopicChart topics={metrics.topics} weakest={metrics.weakest} t={t} topicKey={topicKey} liteMode={liteMode} /></Suspense> : <p className="teacher-no-scores">{t('teacher.noQuizScores')}</p>}
            {metrics.weakest && <p className="teacher-suggestion"><span aria-hidden="true">✦</span>{t('teacher.revisitSuggestion', { topic: t(`teacher.topicNames.${topicKey(metrics.weakest.topic)}`) })}</p>}
          </CardContent>
        </HUDPanel>
        <HUDPanel as={Card} code="SYS-12" label={t('teacher.studentActivity')} className="teacher-roster-card hud-flicker">
          <CardHeader className="teacher-card-header teacher-roster-title-row"><div><span className="teacher-eyebrow">{t('teacher.yourClass')} · {loadedClass.code}</span><CardTitle>{t('teacher.studentActivity')}</CardTitle></div><Button type="button" className="cockpit-button cockpit-button--scan teacher-export-button" onClick={exportReport} disabled={!loadedClass.rows.length}>↓ {t('teacher.downloadReport')}</Button></CardHeader>
          <CardContent className="teacher-table-content">
            <div className="teacher-table-scroll">
              <Table className="teacher-data-table">
                <TableHeader><TableRow>{columns.map(([key, labelKey]) => {
                  const label = labelKey.startsWith('topic') ? t(`teacher.topicNames.${labelKey.slice(5,6).toLowerCase()}${labelKey.slice(6)}`) : t(`teacher.${labelKey}`)
                  return <TableHead key={key}><button type="button" className="teacher-sort-button cockpit-button cockpit-button--scan" onClick={() => toggleSort(key)}>{label}<span aria-hidden="true">{sort.key === key ? sort.direction === 'asc' ? ' ↑' : ' ↓' : ' ↕'}</span></button></TableHead>
                })}</TableRow></TableHeader>
                <TableBody>{sortedRows.map(row => <TableRow key={row.id}>
                  <TableCell className="teacher-student-name">{row.name}</TableCell>
                  <TableCell><span className={`teacher-status-tag status-${row.status}`}>{t(`teacher.statusTags.${row.status}`)}</span></TableCell>
                  <TableCell>{formatScore(row.averageScore)}</TableCell>
                  {TOPICS.map(topic => <TableCell key={topic}>{formatScore(row.quiz_scores[topic])}</TableCell>)}
                  <TableCell>{row.launch_attempts}</TableCell><TableCell>{row.successful_launches}</TableCell><TableCell>{row.planets_explored}</TableCell><TableCell>{formatDate(row.lastActivity)}</TableCell>
                </TableRow>)}</TableBody>
              </Table>
            </div>
            <p className="teacher-table-footnote">{t('teacher.rosterCount', { count: loadedClass.rows.length })} · {t('teacher.activityCount', { count: loadedClass.activityCount })}</p>
          </CardContent>
        </HUDPanel>
      </div>
    </>}
  </main>
}
