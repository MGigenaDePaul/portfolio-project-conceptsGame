import { CONCEPTS, STARTING_CONCEPT_IDS } from "./game/concepts"
const App = () => {
  return (
    <div style={{padding: 16}}>
      <h1>Concepts Game</h1>

      <h2>Starting concepts</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {STARTING_CONCEPT_IDS.map((id) => {
          const c = CONCEPTS[id]
          return (
            <div
              key={c.id}
              style={{
                border: '1px solid #444',
                borderRadius: 12,
                padding: '10px 12px',
                minWidth: 110,
              }}
            >
              <div style={{ fontSize: 28 }}>{c.emoji}</div>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>{c.id}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
