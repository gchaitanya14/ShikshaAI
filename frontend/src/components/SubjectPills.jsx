import React from 'react'

export default function SubjectPills({ subjects, selected, onSelect }) {
  if (!subjects.length) {
    return (
      <span style={{ fontSize: '.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
        No textbooks yet.
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
      {subjects.map(s => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          style={{
            padding: '.28rem .7rem',
            borderRadius: 20,
            fontSize: '.76rem',
            background: selected === s ? 'var(--saffron)' : 'var(--paper-2)',
            border: `1px solid ${selected === s ? 'var(--saffron)' : 'var(--border)'}`,
            color: selected === s ? '#fff' : 'var(--ink-soft)',
            cursor: 'pointer',
            transition: 'all .15s',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
