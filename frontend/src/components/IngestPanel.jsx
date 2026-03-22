import React, { useState, useRef } from 'react'
import SubjectPills from './SubjectPills'
import { ingestPDF } from '../api/client.js'

export default function IngestPanel({ subjects, selectedSubject, onSelectSubject, onRefreshSubjects }) {
  const [file, setFile] = useState(null)
  const [subjectInput, setSubjectInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null) // { type: 'success'|'error', msg }
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  function handleFileChange(f) {
  if (!f) return
  setFile(f)
  if (!subjectInput) {
    setSubjectInput(f.name.replace('.pdf', '').replace(/\s+/g, '_').toLowerCase())
  }
  // Reset input so same file can be re-selected if needed
  if (fileRef.current) fileRef.current.value = ''
}

  async function handleIngest() {
    setAlert(null)
    if (!file) { setAlert({ type: 'error', msg: 'Please select a PDF file.' }); return }
    if (!subjectInput.trim()) { setAlert({ type: 'error', msg: 'Please enter a subject name.' }); return }

    setLoading(true)
    try {
      const result = await ingestPDF(file, subjectInput.trim())
      setAlert({ type: 'success', msg: `✓ Ingested ${result.pages_ingested} pages as "${result.subject}"` })
      await onRefreshSubjects()
      onSelectSubject(result.subject)
    } catch (err) {
      setAlert({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>
        <span style={styles.icon}>📚</span> Upload Textbook
      </div>

      {/* Drop zone */}
      <div
        style={{ ...styles.uploadZone, ...(dragOver ? styles.uploadZoneDrag : {}) }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault(); setDragOver(false)
          const f = e.dataTransfer.files[0]
          if (f?.name.endsWith('.pdf')) handleFileChange(f)
        }}
        onClick={(e) => {
        e.stopPropagation()
        fileRef.current?.click()
      }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onClick={(e) => e.stopPropagation()}
          onChange={e => handleFileChange(e.target.files[0])}
        />
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.3rem' }}>📄</span>
        <div style={styles.uploadLabel}>
          <strong style={{ color: 'var(--saffron)' }}>Click to browse</strong> or drag &amp; drop
        </div>
        {file && (
          <div style={styles.fileName}>{file.name}</div>
        )}
      </div>

      {/* Subject input */}
      <div style={styles.field}>
        <label style={styles.label}>Subject name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. physics, history…"
          value={subjectInput}
          onChange={e => setSubjectInput(e.target.value)}
        />
      </div>

      <button style={{ ...styles.btn, opacity: loading ? 0.55 : 1 }} onClick={handleIngest} disabled={loading}>
        {loading
          ? <><span style={styles.spinner} /> Processing…</>
          : 'Ingest Textbook'}
      </button>

      {alert && (
        <div style={{ ...styles.alert, ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError) }}>
          {alert.msg}
        </div>
      )}

      {/* Subject selector */}
      <div style={styles.divider} />
      <div style={styles.cardTitle}>
        <span style={styles.icon}>🗂</span> Select Subject
      </div>
      <SubjectPills subjects={subjects} selected={selectedSubject} onSelect={onSelectSubject} />
      {selectedSubject && (
        <input
          style={{ ...styles.input, background: 'var(--paper-2)', cursor: 'default' }}
          readOnly
          value={selectedSubject}
        />
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem',
    boxShadow: 'var(--shadow)',
    transition: 'background 0.3s, border-color 0.3s',
    animation: 'riseIn 0.35s ease both',
  },
  cardTitle: {
    fontFamily: "'Lora', serif",
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--ink)',
    marginBottom: '1rem',
    paddingBottom: '0.65rem',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
  },
  icon: {
    width: 20, height: 20,
    background: 'var(--saffron-lt)',
    borderRadius: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
  },
  uploadZone: {
    border: '2px dashed var(--border)',
    borderRadius: 9,
    padding: '1rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'var(--paper)',
    marginBottom: '0.85rem',
  },
  uploadZoneDrag: {
    borderColor: 'var(--saffron)',
    background: 'var(--saffron-lt)',
  },
  uploadLabel: { fontSize: '0.82rem', color: 'var(--ink-soft)' },
  fileName: { marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 500 },
  field: { marginBottom: '0.85rem' },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--ink-soft)',
    marginBottom: '0.35rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1px solid var(--border)',
    borderRadius: 7,
    background: 'var(--paper)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: 'var(--ink)',
    outline: 'none',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1.1rem',
    borderRadius: 7,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.86rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'var(--saffron)',
    color: '#fff',
    width: '100%',
    marginBottom: '0.75rem',
  },
  spinner: {
    display: 'inline-block',
    width: 15, height: 15,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
  alert: {
    padding: '0.65rem 0.9rem',
    borderRadius: 7,
    fontSize: '0.83rem',
    lineHeight: 1.5,
    marginBottom: '0.75rem',
  },
  alertSuccess: {
    background: 'var(--teal-lt)',
    color: 'var(--teal)',
    border: '1px solid rgba(14,124,107,0.2)',
  },
  alertError: {
    background: 'var(--red-lt)',
    color: 'var(--red)',
    border: '1px solid rgba(192,57,43,0.2)',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '1rem 0',
  },
}
