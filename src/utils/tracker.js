const STUDENT_KEY = 'spacelab_student'
const ACTIVITY_KEY = 'spacelab_activity'
const ACTIVITY_TYPES = new Set(['quiz', 'launch', 'planet', 'learn'])
const ACTIVITY_TOPICS = new Set(['Planets', 'Rocket Physics', 'ISRO Missions'])

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function readStudent() {
  try {
    const student = JSON.parse(localStorage.getItem(STUDENT_KEY) || 'null')
    if (!student?.name?.trim() || !student?.classCode?.trim()) return null
    return { name: student.name.trim(), classCode: student.classCode.trim().toUpperCase() }
  } catch {
    return null
  }
}

// Save an activity for the signed-in student; invalid or unavailable storage is a safe no-op.
export function logActivity(type, topic, result, details = {}) {
  if (typeof localStorage === 'undefined') return null
  const student = readStudent()
  if (!student || !ACTIVITY_TYPES.has(type) || (!ACTIVITY_TOPICS.has(topic) && !(['launch', 'learn'].includes(type) && typeof topic === 'string' && topic.trim()))) return null

  const record = {
    studentName: student.name,
    classCode: student.classCode,
    type,
    topic,
    result: result ?? null,
    ...details,
    timestamp: Date.now(),
  }

  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify([...readArray(ACTIVITY_KEY), record]))
    return record
  } catch {
    return null
  }
}

// Return saved activities for one class code, ignoring letter case.
export function getClassData(classCode) {
  if (typeof localStorage === 'undefined' || typeof classCode !== 'string' || !classCode.trim()) return []
  const normalizedCode = classCode.trim().toUpperCase()
  return readArray(ACTIVITY_KEY).filter(record => typeof record?.classCode === 'string' && record.classCode.trim().toUpperCase() === normalizedCode)
}
