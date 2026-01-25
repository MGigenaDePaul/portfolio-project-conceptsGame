import { CONCEPTS, STARTING_CONCEPT_IDS } from '../game/concepts'
import { useState } from 'react'
import { combine } from '../game/combine'
import './ShowConcepts.css'
const ShowConcepts = () => {
  const [cA, setCA] = useState(null)
  const [cB, setCB] = useState(null)
  const [result, setResult] = useState(null)

  const onCombine = () => {
    const r = combine(cA, cB)
    setResult(r)
  }

   const mainColor = {
    color: '#C8D1DB'
  }

  return (
    <div>
      <h1 className="title-game" style={mainColor}>Concepts Game</h1>
      <h2 style={mainColor}>Pick two concepts</h2>

      <div className="container-individual-concepts">
        {STARTING_CONCEPT_IDS.map((id) => {
          const c = CONCEPTS[id]
          const selected = id === cA || id === cB
          return (
            <button className='buttons-concepts'
              key={c.id}
              onClick={() => {
                if (!cA) setCA(id)
                else if (!cB && id !== cA) setCB(id)
                else {
                  setCA(id)
                  setCB(null)
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: 28 }}>{c.emoji}</div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
              </div>
            </button>
          )
        })}
      </div>
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <div style={{ opacity: 0.85 }}>
          Slot A: {cA ? CONCEPTS[cA].name : '—'} | Slot B:{' '}
          {cB ? CONCEPTS[cB].name : '—'}
        </div>

        <button
          onClick={onCombine}
          disabled={!cA || !cB}
          style={{
            marginLeft: 'auto',
            border: '1px solid #444',
            background: !cA || !cB ? '#222' : '#8b5cf6',
            color: 'white',
            borderRadius: 10,
            padding: '10px 14px',
            cursor: !cA || !cB ? 'not-allowed' : 'pointer',
          }}
        >
          Combine
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Result</h3>
        {result ? (
          <div style={{ fontSize: 22 }}>
            {CONCEPTS[result]?.emoji} {CONCEPTS[result]?.name}{' '}
            <span style={{ opacity: 0.6 }}>({result})</span>
          </div>
        ) : (
          <div style={{ opacity: 0.7 }}>No result yet.</div>
        )}
      </div>
    </div>
  )
}

export default ShowConcepts
