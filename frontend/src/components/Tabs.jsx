import React from 'react'

const TAB_LIST = [
  { id: 'home',    label: '🏠 Home' },
  { id: 'quiz',    label: '🎯 Quiz Mode' },
  { id: 'history', label: '🕐 History' },
]

export default function Tabs({ active, onChange, historyCount }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--paper-2)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      overflowX: 'auto',
      transition: 'background .3s',
    }}>
      {TAB_LIST.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '.7rem 1.1rem',
            fontSize: '.83rem',
            fontWeight: 500,
            color: active === tab.id ? 'var(--saffron)' : 'var(--ink-muted)',
            cursor: 'pointer',
            border: 'none',
            borderBottom: active === tab.id ? '2px solid var(--saffron)' : '2px solid transparent',
            background: 'transparent',
            transition: 'color .2s, border-color .2s',
            display: 'flex', alignItems: 'center', gap: '.35rem',
            userSelect: 'none', whiteSpace: 'nowrap',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {tab.label}
          {tab.id === 'history' && historyCount > 0 && (
            <span style={{
              background: 'var(--saffron)', color: '#fff',
              borderRadius: 10, padding: '.08rem .4rem',
              fontSize: '.68rem', fontWeight: 500,
            }}>{historyCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
