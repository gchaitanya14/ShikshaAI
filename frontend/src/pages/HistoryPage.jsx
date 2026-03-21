import React, { useState } from 'react'

export default function HistoryPage({ history, onClear }) {
  const [expanded, setExpanded] = useState(new Set())

  function toggle(idx) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  if (!history.length) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 2rem', textAlign: 'center', gap: '.6rem' }}>
          <span style={{ fontSize: '2.5rem', opacity: .35 }}>🕐</span>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: '.95rem', color: 'var(--ink-soft)' }}>No history yet</h3>
          <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)', maxWidth: 240, lineHeight: 1.5 }}>
            Your questions and answers will appear here after asking ShikshaAI something.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.85rem' }}>
        <span style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>
          {history.length} conversation{history.length > 1 ? 's' : ''}
        </span>
        <button
          onClick={() => { if (confirm('Clear all chat history?')) onClear() }}
          style={{
            fontSize: '.76rem', padding: '.32rem .7rem', borderRadius: 6,
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--ink-muted)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'all .15s',
          }}
        >
          🗑 Clear all
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
        {history.map((item, idx) => {
          const isOpen = expanded.has(idx)
          const date = new Date(item.time)
          const ts = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

          return (
            <div key={idx} style={{
              background: 'var(--surface)', border: `1px solid ${isOpen ? 'var(--saffron)' : 'var(--border)'}`,
              borderRadius: 9, overflow: 'hidden', transition: 'border-color .2s',
            }}>
              <div
                onClick={() => toggle(idx)}
                style={{
                  padding: '.8rem 1rem', display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: '.75rem', cursor: 'pointer',
                  background: 'var(--paper-2)', transition: 'background .2s',
                }}
              >
                <p style={{ fontSize: '.86rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4, flex: 1 }}>
                  {item.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.2rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '.7rem', color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{ts}</span>
                  <span style={{ fontSize: '.66rem', padding: '.12rem .45rem', borderRadius: 10, background: 'var(--saffron-lt)', color: 'var(--saffron)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {item.subject} · {item.difficulty || 'medium'}
                  </span>
                </div>
                <span style={{ fontSize: '.65rem', color: 'var(--ink-muted)', transition: 'transform .3s', transform: isOpen ? 'rotate(180deg)' : 'none', marginTop: 2 }}>▼</span>
              </div>

              {isOpen && (
                <div style={{ padding: '.85rem 1rem', animation: 'fadeIn .2s ease' }}>
                  <p style={{
                    fontFamily: "'Lora', serif", fontSize: '.86rem', lineHeight: 1.7,
                    color: 'var(--ink)', borderLeft: '3px solid var(--teal)',
                    paddingLeft: '.75rem', marginBottom: '.65rem',
                  }}>
                    {item.answer}
                  </p>
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.7rem', padding: '.15rem .5rem', borderRadius: 20, fontWeight: 500, background: 'var(--teal-lt)', color: 'var(--teal)' }}>
                      ✓ {item.cost_saved_pct}% saved
                    </span>
                    <span style={{ fontSize: '.7rem', padding: '.15rem .5rem', borderRadius: 20, fontWeight: 500, background: 'var(--saffron-lt)', color: 'var(--saffron)' }}>
                      {item.pruned_tokens_est} tokens
                    </span>
                    {item.from_cache && (
                      <span style={{ fontSize: '.7rem', padding: '.15rem .5rem', borderRadius: 20, fontWeight: 500, background: 'var(--teal-lt)', color: 'var(--teal)' }}>
                        ⚡ Cached
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
