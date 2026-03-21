import React, { useRef, useState } from 'react'
import { ingestTextbook } from '../api/client'
import { fetchSubjects } from '../api/client'

export default function UploadCard({ onSubjectsRefresh }) {
  const fileRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)   // { type: 'success'|'error', msg }
  const [dragOver, setDragOver] = useState(false)

  function handleFileChange(file) {
    if (!file) return
    setFileName(file.name)
    if (!subject) setSubject(file.name.replace('.pdf', '').replace(/\s+/g, '_').toLowerCase())
  }

  async function handleIngest() {
    const file = fileRef.current?.files[0]
    if (!file) { setAlert({ type: 'error', msg: 'Please select a PDF file.' }); return }
    if (!subject.trim()) { setAlert({ type: 'error', msg: 'Please enter a subject name.' }); return }
    setLoading(true)
    setAlert(null)
    try {
      const data = await ingestTextbook(file, subject.trim())
      setAlert({ type: 'success', msg: `✓ Ingested ${data.pages_ingested} pages as "${data.subject}"` })
      onSubjectsRefresh(data.subject)
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1.25rem',
      boxShadow: 'var(--shadow)', animation: 'riseIn .35s ease both',
    }}>
      <div style={cardTitleStyle}>
        <span style={iconStyle}>📚</span> Upload Textbook
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          const f = e.dataTransfer.files[0]
          if (f?.name.endsWith('.pdf')) {
            const dt = new DataTransfer(); dt.items.add(f)
            fileRef.current.files = dt.files
            handleFileChange(f)
          }
        }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--saffron)' : 'var(--border)'}`,
          borderRadius: 9, padding: '1rem', textAlign: 'center',
          cursor: 'pointer', position: 'relative',
          background: dragOver ? 'var(--saffron-lt)' : 'var(--paper)',
          transition: 'border-color .2s, background .2s',
          marginBottom: '.85rem',
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef} type="file" accept=".pdf"
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          onChange={e => handleFileChange(e.target.files[0])}
        />
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '.3rem' }}>📄</span>
        <span style={{ fontSize: '.82rem', color: 'var(--ink-soft)' }}>
          Drop PDF here or <strong style={{ color: 'var(--saffron)' }}>browse</strong>
        </span>
        {fileName && (
          <p style={{ marginTop: '.4rem', fontSize: '.78rem', color: 'var(--teal)', fontWeight: 500 }}>
            {fileName}
          </p>
        )}
      </div>

      <div style={{ marginBottom: '.85rem' }}>
        <label style={labelStyle}>Subject Name</label>
        <input
          type="text" value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="e.g. physics, history, math…"
          style={inputStyle}
        />
      </div>

      <button onClick={handleIngest} disabled={loading} style={primaryBtnStyle}>
        {loading
          ? <><span style={spinnerStyle} /> Processing…</>
          : 'Ingest Textbook'}
      </button>

      {alert && (
        <div style={{
          marginTop: '.75rem', padding: '.65rem .9rem', borderRadius: 7, fontSize: '.83rem',
          background: alert.type === 'success' ? 'var(--teal-lt)' : 'var(--red-lt)',
          color: alert.type === 'success' ? 'var(--teal)' : 'var(--red)',
          border: `1px solid ${alert.type === 'success' ? 'rgba(14,124,107,.2)' : 'rgba(192,57,43,.2)'}`,
        }}>
          {alert.msg}
        </div>
      )}
    </div>
  )
}

// ── Shared micro-styles ───────────────────────────────────────────────────────

export const cardTitleStyle = {
  fontFamily: "'Lora', serif", fontSize: '.95rem', fontWeight: 600,
  color: 'var(--ink)', marginBottom: '1rem', paddingBottom: '.65rem',
  borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '.45rem',
}

export const iconStyle = {
  width: 20, height: 20, background: 'var(--saffron-lt)', borderRadius: 5,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
}

export const labelStyle = {
  display: 'block', fontSize: '.75rem', fontWeight: 500,
  color: 'var(--ink-soft)', marginBottom: '.35rem',
  textTransform: 'uppercase', letterSpacing: '.04em',
}

export const inputStyle = {
  width: '100%', padding: '.6rem .8rem',
  border: '1px solid var(--border)', borderRadius: 7,
  background: 'var(--paper)', fontFamily: "'DM Sans', sans-serif",
  fontSize: '.9rem', color: 'var(--ink)', outline: 'none',
  transition: 'border-color .2s, background .3s',
}

export const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '.4rem', padding: '.6rem 1.1rem', borderRadius: 7,
  fontFamily: "'DM Sans', sans-serif", fontSize: '.86rem', fontWeight: 500,
  cursor: 'pointer', border: 'none',
  background: 'var(--saffron)', color: '#fff', width: '100%',
  transition: 'all .18s',
}

export const spinnerStyle = {
  display: 'inline-block', width: 15, height: 15,
  border: '2px solid rgba(255,255,255,.4)',
  borderTopColor: '#fff', borderRadius: '50%',
  animation: 'spin .7s linear infinite', flexShrink: 0,
}
