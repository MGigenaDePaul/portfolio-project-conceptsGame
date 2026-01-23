import { CONCEPTS, STARTING_CONCEPT_IDS } from './game/concepts'
import { combine } from './game/combine'
import { useState } from 'react'

const App = () => {
  const [a, setA] = useState(null)
  const [b, setB] = useState(null)
  const [result, setResult] = useState(null)

  const onCombine = () => {
    const r = combine(a, b)
    setResult(r)
  }

   return (
    <div style={{ padding: 16 }}>
      <h1>Concepts Game</h1>

      <h2>Pick two concepts</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {STARTING_CONCEPT_IDS.map((id) => {
          const c = CONCEPTS[id]
          const selected = id === a || id === b
          return (
            <button
              key={c.id}
              onClick={() => {
                if (!a) setA(id)
                else if (!b && id !== a) setB(id)
                  else {
                  setA(id)
                  setB(null)
                  setResult(null)
                }
              }}  
              style={{
                border: selected ? '2px solid #8b5cf6' : '1px solid #444',
                background: '#111',
                color: 'white',
                borderRadius: 12,
                padding: '10px 12px',
                minWidth: 120,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div style={{ fontSize: 28 }}>{c.emoji}</div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ opacity: 0.85 }}>
          Slot A: {a ? CONCEPTS[a].name : '—'} | Slot B: {b ? CONCEPTS[b].name : '—'}
        </div>

        <button
          onClick={onCombine}
          disabled={!a || !b}
          style={{
            marginLeft: 'auto',
            border: '1px solid #444',
            background: !a || !b ? '#222' : '#8b5cf6',
            color: 'white',
            borderRadius: 10,
            padding: '10px 14px',
            cursor: !a || !b ? 'not-allowed' : 'pointer',
          }}
        >
          Combine
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Result</h3>
        {result ? (
          <div style={{ fontSize: 22 }}>
            {CONCEPTS[result]?.emoji} {CONCEPTS[result]?.name} <span style={{ opacity: 0.6 }}>({result})</span>
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>No result yet.</div>
        )}
      </div>

      <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
        Tip: Click a concept to fill slots. If both slots filled, clicking any concept resets and sets Slot A.
      </div>
    </div>
  )
}

export default App
