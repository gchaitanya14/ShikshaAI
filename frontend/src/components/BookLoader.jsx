import React from 'react'

const LOADING_MESSAGES = [
  'Searching through textbook pages…',
  'Pruning irrelevant content…',
  'Thinking of the best explanation…',
  'Almost ready…',
]

export default function BookLoader({ visible }) {
  const [msgIdx, setMsgIdx] = React.useState(0)

  React.useEffect(() => {
    if (!visible) return
    setMsgIdx(0)
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [visible])

  if (!visible) return null

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2.5rem 1rem', gap: '.85rem',
    }}>
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <div style={{
          position: 'absolute',
          width: 26, height: 40,
          background: 'var(--saffron)', borderRadius: 3,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'bookPulse 1.4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 18, height: 32,
          background: 'var(--teal)', borderRadius: 3,
          left: '50%', top: '50%',
          transform: 'translate(-28%, -50%)',
          animation: 'bookPulse 1.4s ease-in-out infinite 0.2s',
          opacity: 0.7,
        }} />
      </div>

      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i === 1 ? 'var(--teal)' : 'var(--saffron)',
            display: 'inline-block',
            animation: `dotBounce 1.2s ease-in-out infinite ${i * 0.15}s`,
          }} />
        ))}
      </div>

      <p style={{
        fontSize: '.82rem', color: 'var(--ink-muted)', fontStyle: 'italic',
        animation: 'fadeText 2s ease-in-out infinite',
      }}>
        {LOADING_MESSAGES[msgIdx]}
      </p>
    </div>
  )
}
