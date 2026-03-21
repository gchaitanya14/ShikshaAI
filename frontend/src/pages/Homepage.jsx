import React, { useEffect, useState } from 'react'
import UploadCard from '../components/UploadCard'
import AskCard from '../components/AskCard'
import { fetchSubjects } from '../api/client'

export default function HomePage({ onSaveHistory }) {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')

  async function loadSubjects() {
    try {
      const data = await fetchSubjects()
      setSubjects(data.subjects || [])
    } catch (_) {}
  }

  useEffect(() => { loadSubjects() }, [])

  function handleSubjectsRefresh(newSubject) {
    loadSubjects()
    setSelectedSubject(newSubject)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <UploadCard onSubjectsRefresh={handleSubjectsRefresh} />
      <AskCard
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSelectSubject={s => { setSelectedSubject(s); loadSubjects() }}
        onSaveHistory={onSaveHistory}
      />
    </div>
  )
}
