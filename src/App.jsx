import { useState, useEffect, useRef } from 'react'
import { CONCEPTS, STARTING_CONCEPT_IDS } from './game/concepts'
import { combine } from './game/combine'
import ConceptBubble from './components/ConceptBubble'
import './App.css'

const HIT_RADIUS = 46 // qué tan cerca tiene que estar para "drop encima"

function App() {
  const [discoveredIds, setDiscoveredIds] = useState(STARTING_CONCEPT_IDS)
  const [positions, setPositions] = useState({})

  // dragging state
  const draggingRef = useRef({
    id: null,
    offsetX: 0,
    offsetY: 0,
  })

  // initial positions (solo una vez)
  useEffect(() => {
    const newPositions = {}
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const radius = 280

    STARTING_CONCEPT_IDS.forEach((id, index) => {
      const angle = (index / STARTING_CONCEPT_IDS.length) * Math.PI * 2
      newPositions[id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })

    setPositions(newPositions)
  }, [])

  // encuentra el target más cercano dentro del radio
  const getHitTarget = (dragId, currentPositions) => {
    const p = currentPositions[dragId]
    if (!p) return null

    let best = null
    let bestDist = Infinity

    for (const otherId of discoveredIds) {
      if (otherId === dragId) continue
      const q = currentPositions[otherId]
      if (!q) continue

      const dist = Math.hypot(p.x - q.x, p.y - q.y)
      if (dist < HIT_RADIUS && dist < bestDist) {
        bestDist = dist
        best = otherId
      }
    }

    return best
  }

  // combina y reemplaza: borra a y b, crea result
  const combineAndReplace = (aId, bId, spawnPos) => {
    const resultId = combine(aId, bId)
    if (!resultId) return false

    // 1) actualizar discoveredIds (sacar a y b, meter result si no está)
    setDiscoveredIds((prev) => {
      const filtered = prev.filter((id) => id !== aId && id !== bId)
      return filtered.includes(resultId) ? filtered : [...filtered, resultId]
    })

    // 2) actualizar posiciones (borrar a y b, setear result en spawnPos)
    setPositions((prev) => {
      const next = { ...prev }
      delete next[aId]
      delete next[bId]

      next[resultId] = { x: spawnPos.x, y: spawnPos.y }
      return next
    })

    return true
  }

  const onPointerDownBubble = (id) => (e) => {
    e.preventDefault()
    e.stopPropagation()

    const p = positions[id]
    if (!p) return

    e.currentTarget.setPointerCapture?.(e.pointerId)

    draggingRef.current = {
      id,
      offsetX: e.clientX - p.x,
      offsetY: e.clientY - p.y,
    }
  }

  useEffect(() => {
    const onMove = (e) => {
      const d = draggingRef.current
      if (!d.id) return

      const x = e.clientX - d.offsetX
      const y = e.clientY - d.offsetY

      setPositions((prev) => ({
        ...prev,
        [d.id]: { x, y },
      }))
    }

    const onUp = (e) => {
      const d = draggingRef.current
      if (!d.id) return

      const dragId = d.id
      draggingRef.current.id = null

      // MUY IMPORTANTE:
      // usamos setPositions callback para tener el "estado más nuevo" y no uno viejo.
      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev)
        if (!targetId) return prev

        const spawnPos = prev[dragId]
        if (!spawnPos) return prev

        // combinamos (esto hará setDiscoveredIds + setPositions extra)
        // y acá devolvemos prev tal cual, porque el cambio real lo hace combineAndReplace.
        combineAndReplace(dragId, targetId, spawnPos)
        return prev
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [discoveredIds, positions]) // lo dejamos así por ahora (funciona perfecto)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          Concepts <span className="app-subtitle">Demo</span>
        </h1>
      </header>

      <div className="concepts-area">
        {discoveredIds.map((id) => {
          const concept = CONCEPTS[id]
          const position = positions[id] || { x: 0, y: 0 }

          return (
            <ConceptBubble
              key={id}
              concept={concept}
              position={position}
              onPointerDown={onPointerDownBubble(id)}
            />
          )
        })}
      </div>

      <footer className="app-footer">
        <p>CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT, 
          DISCOVERED CONCEPTS WILL BE LOST</p>
      </footer>

      {/* Si querés que la barra de abajo NO sea draggable, la sacamos después.
          Por ahora la dejo fuera para no duplicar conceptos (te explico abajo). */}
    </div>
  )
}

export default App
