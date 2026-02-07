import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CONCEPTS, generateInstanceId } from '../game/concepts'
import { combine } from '../game/combine'
import '../components/ConceptBubble.css'
import './Board.css'

const getHitRadius = () => {
  const width = window.innerWidth
  if (width < 480) return 60
  if (width < 768) return 75
  return 100
}

const Board = () => {
  const [instances, setInstances] = useState({})
  const [positions, setPositions] = useState({})
  const [discoveredConcepts, setDiscoveredConcepts] = useState(new Set(['fire', 'water', 'air', 'earth']))
  const [hoverTargetId, setHoverTargetId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [zIndexes, setZIndexes] = useState({})
  const [hitRadius, setHitRadius] = useState(getHitRadius())
  const [isCombining, setIsCombining] = useState(false)

  const combineAudioRef = useRef(null)
  const failAudioRef = useRef(null)
  const pressBubbleAudioRef = useRef(null)
  const soundBeforeCombiningAudioRef = useRef(null)
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 })

  // Initialize audio
  useEffect(() => {
    const combineAudio = new Audio('/sounds/success.mp3')
    combineAudio.volume = 0.6
    combineAudio.preload = 'auto'

    const failAudio = new Audio('/sounds/fail.mp3')
    failAudio.volume = 0.4
    failAudio.preload = 'auto'

    const pressBubbleAudio = new Audio('/sounds/pressBubble.mp3')
    pressBubbleAudio.volume = 0.5
    pressBubbleAudio.preload = 'auto'

    const soundBeforeCombiningAudio = new Audio('/sounds/soundBeforeCombining.mp3')
    soundBeforeCombiningAudio.volume = 0.4
    soundBeforeCombiningAudio.preload = 'auto'

    combineAudioRef.current = combineAudio
    failAudioRef.current = failAudio
    pressBubbleAudioRef.current = pressBubbleAudio
    soundBeforeCombiningAudioRef.current = soundBeforeCombiningAudio
  }, [])

  const play = (ref) => {
    const a = ref.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  // Initialize starting instances (4 classical elements)
  useEffect(() => {
    const startingConcepts = ['fire', 'water', 'air', 'earth']
    const newInstances = {}
    const newPositions = {}

    const centerX = (window.innerWidth - 220 - 320) / 2 + 220 // Account for both sidebars
    const centerY = window.innerHeight / 2

    startingConcepts.forEach((conceptId, index) => {
      const instanceId = generateInstanceId()
      newInstances[instanceId] = {
        instanceId,
        conceptId,
        isNewlyCombined: false,
      }

      // Position in a circle around center
      const angle = (index / startingConcepts.length) * Math.PI * 2
      const radius = 150
      newPositions[instanceId] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })

    setInstances(newInstances)
    setPositions(newPositions)
  }, [])

  useEffect(() => {
    const handleResize = () => setHitRadius(getHitRadius())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getHitTarget = (dragId, currentPositions) => {
    const p = currentPositions[dragId]
    if (!p) return null

    let best = null
    let bestDist = Infinity

    for (const otherId of Object.keys(instances)) {
      if (otherId === dragId) continue
      const q = currentPositions[otherId]
      if (!q) continue

      const dist = Math.hypot(p.x - q.x, p.y - q.y)
      if (dist < hitRadius && dist < bestDist) {
        bestDist = dist
        best = otherId
      }
    }

    return best
  }

  const combineAndReplace = (aInstanceId, bInstanceId, spawnPos) => {
    const aInstance = instances[aInstanceId]
    const bInstance = instances[bInstanceId]
    if (!aInstance || !bInstance) return false

    const resultConceptId = combine(aInstance.conceptId, bInstance.conceptId)
    if (!resultConceptId) return false

    play(combineAudioRef)

    const resultInstanceId = generateInstanceId()

    // Add to discovered concepts
    setDiscoveredConcepts((prev) => new Set([...prev, resultConceptId]))

    setInstances((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]
      delete next[bInstanceId]
      next[resultInstanceId] = {
        instanceId: resultInstanceId,
        conceptId: resultConceptId,
        isNewlyCombined: true,
      }
      return next
    })

    setPositions((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]
      delete next[bInstanceId]
      next[resultInstanceId] = { x: spawnPos.x, y: spawnPos.y }
      return next
    })

    return true
  }

  const onPointerDownBubble = (instanceId) => (e) => {
    if (isCombining) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    e.preventDefault()
    e.stopPropagation()
    play(pressBubbleAudioRef)

    const p = positions[instanceId]
    if (!p) return

    setDraggingId(instanceId)
    setZIndexes((prev) => ({ ...prev, [instanceId]: 9999 }))

    e.currentTarget.setPointerCapture?.(e.pointerId)

    draggingRef.current = {
      id: instanceId,
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

      setPositions((prev) => {
        const next = { ...prev, [d.id]: { x, y } }
        const targetId = getHitTarget(d.id, next)
        setHoverTargetId(targetId)

        if (targetId) {
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: 100,
            [d.id]: 9999,
          }))
        }

        return next
      })
    }

    const onUp = () => {
      const d = draggingRef.current
      if (!d.id) return

      const dragId = d.id
      draggingRef.current.id = null

      setDraggingId(null)
      setHoverTargetId(null)

      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev)

        if (!targetId) {
          setZIndexes((prevZ) => {
            const next = { ...prevZ }
            delete next[dragId]
            return next
          })
          return prev
        }

        const spawnPos = prev[dragId]
        if (!spawnPos) return prev

        play(soundBeforeCombiningAudioRef)
        setIsCombining(true)

        setTimeout(() => {
          const combined = combineAndReplace(dragId, targetId, spawnPos)

          if (!combined) {
            play(failAudioRef)
          }

          setZIndexes((prevZ) => {
            const next = { ...prevZ }
            delete next[dragId]
            delete next[targetId]
            return next
          })
          setIsCombining(false)
        }, 700)

        return prev
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [instances, hitRadius, isCombining])

  // Organize discovered concepts into categories
  const organizeByCategory = () => {
    const categories = {
      UNCATEGORIZED: [],
    }

    discoveredConcepts.forEach((conceptId) => {
      const concept = CONCEPTS[conceptId]
      if (!concept) return

      const category = concept.category || 'UNCATEGORIZED'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push({
        name: concept.name,
        emoji: concept.emoji,
        conceptId,
      })
    })

    return categories
  }

  const categories = organizeByCategory()

  return (
    <div className="board-container">
      {/* Sidebar */}
      <div className="board-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">📚</span>
          <span className="sidebar-title">MY COLLECTION</span>
        </div>
        
        <div className="collection-item active">
          <span className="collection-emoji">🧪</span>
          <span className="collection-name">States of Matter</span>
          <span className="collection-indicator">🟢</span>
        </div>
      </div>

      {/* Main board area */}
      <div className="board-main">
        {/* Top toolbar */}
        <div className="board-toolbar">
          <button className="toolbar-btn" title="Undo">
            <span>↶</span>
          </button>
          <button className="toolbar-btn" title="Collections">
            <span>📊</span>
          </button>
          <button className="toolbar-btn" title="Home">
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              <span>🏠</span>
            </Link>
          </button>
          <button className="toolbar-btn" title="Settings">
            <span>⚙️</span>
          </button>
        </div>

        {/* Concepts on board */}
        <div className="board-canvas">
          {Object.values(instances).map((instance) => {
            const position = positions[instance.instanceId]
            if (!position) return null

            const concept = CONCEPTS[instance.conceptId]
            if (!concept) return null

            return (
              <div
                key={instance.instanceId}
                className={`board-concept concept-bubble concept-${instance.conceptId} ${
                  draggingId === instance.instanceId ? 'dragging' : ''
                } ${hoverTargetId === instance.instanceId ? 'drop-target' : ''}`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  zIndex: zIndexes[instance.instanceId] || 5,
                  cursor: draggingId === instance.instanceId ? 'grabbing' : 'grab',
                }}
                onPointerDown={onPointerDownBubble(instance.instanceId)}
              >
                <span className="board-concept-emoji">{concept.emoji}</span>
                <span className="board-concept-name">{concept.name}</span>
              </div>
            )
          })}

          {/* Warning message */}
          <div className="board-warning">
            <p>CONCEPTS IS STILL UNDER HEAVY</p>
            <p>DEVELOPMENT. DISCOVERED CONCEPTS</p>
            <p>WILL BE LOST</p>
          </div>
        </div>
      </div>

      {/* Knowledge sidebar */}
      <div className="knowledge-sidebar">
        <div className="knowledge-header">
          <h2 className="knowledge-title">Knowledge</h2>
          <p className="knowledge-count">{discoveredConcepts.size} concepts</p>
        </div>

        <div className="knowledge-search">
          <input
            type="text"
            placeholder="Search everything... (Control + F)"
            className="knowledge-search-input"
          />
          <button className="knowledge-filter-btn">☰</button>
        </div>

        <div className="knowledge-categories">
          {Object.entries(categories).map(([categoryName, items]) => (
            items.length > 0 && (
              <div key={categoryName} className="knowledge-category">
                <div className="category-header">
                  <span className="category-name">{categoryName}</span>
                  <span className="category-count">{items.length}</span>
                </div>
                <div className="category-items">
                  {items.map((item, idx) => (
                    <div key={idx} className="category-item">
                      <span className="category-item-emoji">{item.emoji}</span>
                      <span className="category-item-name">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default Board