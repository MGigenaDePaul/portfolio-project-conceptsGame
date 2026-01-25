import { useState, useEffect, useRef } from 'react'
import { CONCEPTS, STARTING_CONCEPT_IDS } from './game/concepts'
import { combine } from './game/combine'
import ConceptBubble from './components/ConceptBubble'
import MyBoards from './components/MyBoards'
import './App.css'

const HIT_RADIUS = 46 // tweak: how close to count as a "drop on top"

function App() {
  const [discoveredIds, setDiscoveredIds] = useState(STARTING_CONCEPT_IDS)
  const [selectedA, setSelectedA] = useState(null)
  const [selectedB, setSelectedB] = useState(null)
  const [positions, setPositions] = useState({})

  // dragging state
  const draggingRef = useRef({
    id: null,
    offsetX: 0,
    offsetY: 0,
    wasDrag: false,
  })

  // initial positions
  useEffect(() => {
    const newPositions = {}
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const radius = 280

    discoveredIds.forEach((id, index) => {
      const angle = (index / discoveredIds.length) * Math.PI * 2
      newPositions[id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })
    setPositions(newPositions)
  }, []) // only once on mount

  // helper: combine and spawn result near drop point
  const tryCombine = (aId, bId, spawnNear) => {
    const resultId = combine(aId, bId)
    if (!resultId) return false

    if (!discoveredIds.includes(resultId)) {
      setDiscoveredIds((prev) => [...prev, resultId])

      const centerX = spawnNear?.x ?? window.innerWidth / 2
      const centerY = spawnNear?.y ?? window.innerHeight / 2
      const angle = Math.random() * Math.PI * 2
      const r = 60 + Math.random() * 60

      setPositions((prev) => ({
        ...prev,
        [resultId]: {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
        },
      }))
    }

    // optional: remove selection highlights after success
    setSelectedA(null)
    setSelectedB(null)
    return true
  }

  const handleConceptClick = (id) => {
    // if it was a drag, don't treat as click
    if (draggingRef.current.wasDrag) return

    if (!selectedA) setSelectedA(id)
    else if (!selectedB && id !== selectedA) setSelectedB(id)
    else {
      setSelectedA(id)
      setSelectedB(null)
    }
  }

  const getHitTarget = (dragId) => {
    const p = positions[dragId]
    if (!p) return null

    let best = null
    let bestDist = Infinity

    for (const otherId of discoveredIds) {
      if (otherId === dragId) continue
      const q = positions[otherId]
      if (!q) continue
      const dx = p.x - q.x
      const dy = p.y - q.y
      const dist = Math.hypot(dx, dy)
      if (dist < HIT_RADIUS && dist < bestDist) {
        bestDist = dist
        best = otherId
      }
    }
    return best
  }

  const onPointerDownBubble = (id) => (e) => {
    // left click / touch only
    e.preventDefault()
    e.stopPropagation()

    const p = positions[id]
    if (!p) return

    // capture pointer so we keep receiving move/up even if cursor leaves button
    e.currentTarget.setPointerCapture?.(e.pointerId)

    draggingRef.current = {
      id,
      offsetX: e.clientX - p.x,
      offsetY: e.clientY - p.y,
      wasDrag: false,
    }
  }

  useEffect(() => {
    const onMove = (e) => {
      const d = draggingRef.current
      if (!d.id) return

      d.wasDrag = true

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

      // if it was just a tiny click, allow click handler
      // (we keep wasDrag true only if move happened)
      const targetId = getHitTarget(dragId)
      if (targetId) {
        // try combine at drop point
        const p = positions[dragId]
        tryCombine(dragId, targetId, p)
      }

      // reset after a tick so click doesn't fire
      setTimeout(() => {
        draggingRef.current.wasDrag = false
      }, 0)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [discoveredIds, positions]) // ok for now; later we can optimize

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
          const isSelected = id === selectedA || id === selectedB

          return (
            <ConceptBubble
              key={id}
              concept={concept}
              position={position}
              onClick={() => handleConceptClick(id)}
              isSelected={isSelected}
              onPointerDown={onPointerDownBubble(id)}
            />
          )
        })}
      </div>

      {/* keep MyBoards for now; you can remove combine button later */}
      <MyBoards
        discoveredConcepts={discoveredIds.length}
        onCombine={() => {}}
        selectedA={selectedA ? CONCEPTS[selectedA] : null}
        selectedB={selectedB ? CONCEPTS[selectedB] : null}
      />

      <footer className="app-footer">
        <p>CONCEPTS IS STILL UNDER HEAVY</p>
      </footer>

      <div className="bottom-concepts">
        <ConceptBubble
          concept={CONCEPTS.earth}
          position={{ x: '40%', y: '88%' }}
          onClick={() => handleConceptClick('earth')}
          isSelected={selectedA === 'earth' || selectedB === 'earth'}
          onPointerDown={onPointerDownBubble('earth')}
        />
        <ConceptBubble
          concept={CONCEPTS.air}
          position={{ x: '60%', y: '88%' }}
          onClick={() => handleConceptClick('air')}
          isSelected={selectedA === 'air' || selectedB === 'air'}
          onPointerDown={onPointerDownBubble('air')}
        />
      </div>
    </div>
  )
}

export default App
