// All fetch calls go through Vite's proxy (/api → http://localhost:8000/api)
// so no hardcoded base URL is needed in development.

export async function fetchSubjects() {
  const res = await fetch('/api/subjects')
  if (!res.ok) throw new Error('Failed to fetch subjects')
  return res.json()
}

export async function ingestPDF(file, subject) {
  const form = new FormData()
  form.append('file', file)
  form.append('subject', subject)
  const res = await fetch('/api/ingest', { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Ingestion failed')
  return data
}

export async function askQuestion(question, subject, difficulty) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, subject, difficulty }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Something went wrong')
  return data
}

export async function generateMCQ(topic, subject, numQuestions) {
  const res = await fetch('/api/mcq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, subject, num_questions: numQuestions }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Could not generate quiz')
  return data
}
