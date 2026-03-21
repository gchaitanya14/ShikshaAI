import React from 'react'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header style={{
      background: 'var(--header-bg)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '.75rem',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 200,
    }}>
      <div style={{
        width: 34, height: 34,
        background: 'var(--saffron)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Lora', serif", fontWeight: 600, color: '#fff', fontSize: 17,
        flexShrink: 0,
      }}>S</div>

      <span style={{ fontFamily: "'Lora', serif", fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
        ShikshaAI
      </span>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
        <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
          Education Tutor · Rural India
        </span>
        <button
          onClick={onToggleTheme}
          style={{
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 20,
            padding: '.28rem .7rem',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '.35rem',
            color: 'rgba(255,255,255,.75)',
            fontSize: '.76rem',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'background .2s',
          }}
        >
          <span style={{ fontSize: 13, transition: 'transform .4s', transform: theme === 'dark' ? 'rotate(180deg)' : 'none' }}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </span>
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  )
}
