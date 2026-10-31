import { createContext, useContext, useEffect, useState } from 'react'

const StudentContext = createContext(null)

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const saved = localStorage.getItem('spacelab_student')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // quiz results and rocket attempts per student/class
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('spacelab_results')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('spacelab_student', JSON.stringify(student))
    } catch {
      // Keep the app usable when browser storage is unavailable.
    }
  }, [student])

  useEffect(() => {
    try {
      localStorage.setItem('spacelab_results', JSON.stringify(results))
    } catch {
      // Results remain available in memory for this session.
    }
  }, [results])

  const joinClass = ({ name, classCode }) => {
    const nextStudent = { name: name.trim(), classCode: classCode.trim().toUpperCase() }
    setStudent(nextStudent)
    try {
      localStorage.setItem('spacelab_student', JSON.stringify(nextStudent))
    } catch {
      // The context still works for this session without storage.
    }
  }

  const leaveClass = () => {
    setStudent(null)
    try {
      localStorage.removeItem('spacelab_student')
    } catch {
      // The context still works for this session without storage.
    }
  }

  const addResult = (result) => {
    setResults(prev => [
      ...prev,
      { ...result, studentName: student?.name, classCode: student?.classCode, timestamp: Date.now() }
    ])
  }

  return (
    <StudentContext.Provider value={{ student, joinClass, leaveClass, results, addResult }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudent must be used within StudentProvider')
  return ctx
}
