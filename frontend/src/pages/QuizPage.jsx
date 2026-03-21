import React, { useEffect, useState } from 'react'
import SubjectPills from '../components/SubjectPills'
import BookLoader from '../components/BookLoader'
import { fetchSubjects, generateMCQ } from '../api/client'
import { cardTitleStyle, iconStyle, spinnerStyle } from '../components/UploadCard'

const Q_COUNTS = [3, 5, 8, 10]

function downloadResults(subject, score, questions, userAnswers) {
  let content = `SHIKSHA AI — QUIZ RESULTS\n${'='.repeat(50)}\nSubject: ${subject}\nScore: ${score}/${questions.length}\nDate: ${new Date().toLocaleDateString('en-IN')}\n\n`
  questions.forEach((q, i) => {
    const ua = userAnswers[i]
    content += `Q${i + 1}: ${q.question}\n${q.options.join('\n')}\nYour: ${ua?.letter || '—'} | Correct: ${q.correct}\n${q.explanation}\n\n`
  })
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url; a.download = `shiksha_quiz_${Date.now()}.txt`; a.click()
  URL.revokeObjectURL(url)
}

export default function QuizPage() {
  const [subjects, setSubjects] = useState([])
  const [selSubject, setSelSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [qCount, setQCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [screen, setScreen] = useState('setup') // setup | quiz | results

  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  useEffect(() => {
    fetchSubjects().then(d => setSubjects(d.subjects || [])).catch(() => {})
  }, [])

  async function handleStart() {
    setAlert(null)
    if (!topic.trim()) { setAlert({ type: 'error', msg: 'Please enter a topic.' }); return }
    if (!selSubject) { setAlert({ type: 'error', msg: 'Please select a subject.' }); return }
    setLoading(true)
    try {
      const data = await generateMCQ(topic.trim(), selSubject, qCount)
      if (!data.questions?.length) { setAlert({ type: 'error', msg: 'No questions returned. Try a different topic.' }); return }
      setQuestions(data.questions)
      setCurrentIdx(0); setUserAnswers([]); setScore(0); setAnswered(false)
      setScreen('quiz')
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  function selectAnswer(letter) {
    if (answered) return
    const correct = questions[currentIdx].correct
    const isCorrect = letter === correct
    setUserAnswers(prev => [...prev, { letter, correct: isCorrect }])
    if (isCorrect) setScore(s => s + 1)
    setAnswered(true)
  }

  function next() {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1)
      setAnswered(false)
    } else {
      setScreen('results')
    }
  }

  const q = questions[currentIdx]
  const total = questions.length
  const pct = total ? Math.round((score / total) * 100) : 0

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>

      {/* Setup screen */}
      {screen === 'setup' && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}><span style={iconStyle}>🎯</span> Quiz Mode</div>

          <div style={{ marginBottom: '.85rem' }}>
            <label style={labelStyle}>Subject</label>
            <SubjectPills subjects={subjects} selected={selSubject} onSelect={setSelSubject} />
            {subjects.length === 0 && <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '.4rem' }}>Upload a textbook in Home tab first.</p>}
          </div>

          <div style={{ marginBottom: '.85rem' }}>
            <label style={labelStyle}>Topic to Test</label>
            <input
              value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. enter topic like 'software development lifecycle' or 'web development'"
              style={inputStyle}
            />
            <p style={{ fontSize: '.76rem', color: 'var(--ink-muted)', marginTop: '.3rem' }}>Enter any topic from the uploaded textbook.</p>
          </div>

          <div style={{ marginBottom: '.85rem' }}>
            <label style={labelStyle}>Number of Questions</label>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              {Q_COUNTS.map(n => (
                <button key={n} onClick={() => setQCount(n)} style={{
                  flex: 1, padding: '.45rem', borderRadius: 7, fontSize: '.82rem', fontWeight: 500,
                  cursor: 'pointer', border: `1px solid ${qCount === n ? 'var(--saffron)' : 'var(--border)'}`,
                  background: qCount === n ? 'var(--saffron)' : 'var(--paper)',
                  color: qCount === n ? '#fff' : 'var(--ink-soft)',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all .15s',
                }}>{n}</button>
              ))}
            </div>
          </div>

          <button onClick={handleStart} disabled={loading} style={primaryBtnStyle}>
            {loading ? <><span style={spinnerStyle} /> Generating quiz…</> : 'Generate Quiz'}
          </button>

          {alert && (
            <div style={{ marginTop: '.75rem', padding: '.65rem .9rem', borderRadius: 7, fontSize: '.83rem', background: 'var(--red-lt)', color: 'var(--red)', border: '1px solid rgba(192,57,43,.2)' }}>
              {alert.msg}
            </div>
          )}
        </div>
      )}

      {/* Quiz in progress */}
      {screen === 'quiz' && q && (
        <div style={cardStyle}>
          {/* Progress bar */}
          <div style={{ height: 5, background: 'var(--paper-3)', borderRadius: 5, marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--saffron)', borderRadius: 5, width: `${(currentIdx / total) * 100}%`, transition: 'width .4s ease' }} />
          </div>

          <p style={{ fontSize: '.75rem', color: 'var(--ink-muted)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Question {currentIdx + 1} of {total}
          </p>
          <p style={{ fontFamily: "'Lora', serif", fontSize: '1.05rem', color: 'var(--ink)', lineHeight: 1.55, marginBottom: '1.1rem', fontWeight: 600 }}>
            {q.question}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.1rem' }}>
            {q.options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i]
              const isCorrect = answered && letter === q.correct
              const isWrong = answered && letter === userAnswers[currentIdx]?.letter && !userAnswers[currentIdx]?.correct
              return (
                <button key={i} onClick={() => selectAnswer(letter)} disabled={answered} style={{
                  padding: '.75rem 1rem', borderRadius: 8, textAlign: 'left',
                  fontSize: '.9rem', cursor: answered ? 'default' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all .18s',
                  border: `1.5px solid ${isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : 'var(--border)'}`,
                  background: isCorrect ? 'var(--green-lt)' : isWrong ? 'var(--red-lt)' : 'var(--surface)',
                  color: isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : 'var(--ink)',
                }}>
                  {opt}
                </button>
              )
            })}
          </div>

          {answered && (
            <div style={{ background: 'var(--blue-lt)', border: '1px solid rgba(26,95,168,.2)', borderRadius: 8, padding: '.75rem 1rem', fontSize: '.85rem', color: 'var(--blue)', lineHeight: 1.5, marginBottom: '1rem', animation: 'fadeIn .3s ease' }}>
              💡 {q.explanation}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>Score: {score}</span>
            {answered && (
              <button onClick={next} style={{ ...primaryBtnStyle, width: 'auto', padding: '.55rem 1.25rem' }}>
                {currentIdx + 1 < total ? 'Next →' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results screen */}
      {screen === 'results' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', animation: 'riseIn .4s ease' }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: '6px solid var(--saffron)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: '2rem', fontWeight: 600, color: 'var(--saffron)', lineHeight: 1 }}>{score}/{total}</span>
              <span style={{ fontSize: '.72rem', color: 'var(--ink-muted)' }}>Score</span>
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '.4rem' }}>
              {pct >= 80 ? '🌟 Excellent!' : pct >= 60 ? '👍 Good job!' : pct >= 40 ? '📖 Keep studying' : "💪 Don't give up"}
            </p>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-soft)', marginBottom: '1.5rem' }}>
              {pct >= 80 ? `You got ${score}/${total} correct. Outstanding!` : pct >= 60 ? `You got ${score}/${total}. Keep it up!` : pct >= 40 ? `You got ${score}/${total}. Review and try again.` : `You got ${score}/${total}. Read the chapter carefully!`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
            {questions.map((question, i) => {
              const ua = userAnswers[i]
              return (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '.85rem 1rem' }}>
                  <p style={{ fontSize: '.88rem', fontWeight: 500, color: 'var(--ink)', marginBottom: '.4rem' }}>{i + 1}. {question.question}</p>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.3rem' }}>
                    <span style={{ fontSize: '.75rem', padding: '.18rem .55rem', borderRadius: 20, fontWeight: 500, background: ua?.correct ? 'var(--green-lt)' : 'var(--red-lt)', color: ua?.correct ? 'var(--green)' : 'var(--red)' }}>
                      {ua?.correct ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    <span style={{ fontSize: '.75rem', padding: '.18rem .55rem', borderRadius: 20, fontWeight: 500, background: 'var(--blue-lt)', color: 'var(--blue)' }}>
                      Answer: {question.correct}
                    </span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>{question.explanation}</p>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <button onClick={() => { setScreen('setup'); setTopic(''); setSelSubject('') }} style={{ ...primaryBtnStyle, flex: 1 }}>🔄 Try Again</button>
            <button onClick={() => downloadResults(selSubject, score, questions, userAnswers)} style={{ ...outlineBtnStyle, flex: 1 }}>⬇ Download Results</button>
          </div>
        </div>
      )}
    </div>
  )
}

const cardStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '1.25rem',
  boxShadow: 'var(--shadow)', animation: 'riseIn .35s ease both',
}

const labelStyle = {
  display: 'block', fontSize: '.75rem', fontWeight: 500,
  color: 'var(--ink-soft)', marginBottom: '.35rem',
  textTransform: 'uppercase', letterSpacing: '.04em',
}

const inputStyle = {
  width: '100%', padding: '.6rem .8rem',
  border: '1px solid var(--border)', borderRadius: 7,
  background: 'var(--paper)', fontFamily: "'DM Sans', sans-serif",
  fontSize: '.9rem', color: 'var(--ink)', outline: 'none',
}

const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '.4rem', padding: '.6rem 1.1rem', borderRadius: 7,
  fontFamily: "'DM Sans', sans-serif", fontSize: '.86rem', fontWeight: 500,
  cursor: 'pointer', border: 'none',
  background: 'var(--saffron)', color: '#fff', width: '100%',
  transition: 'all .18s',
}

const outlineBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
  padding: '.6rem 1.1rem', borderRadius: 7,
  fontFamily: "'DM Sans', sans-serif", fontSize: '.86rem', fontWeight: 500,
  cursor: 'pointer', background: 'transparent',
  border: '1px solid var(--border)', color: 'var(--ink-soft)', transition: 'all .18s',
}
