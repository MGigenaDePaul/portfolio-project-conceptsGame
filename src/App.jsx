import { useState, useEffect, useRef } from 'react'
import {
  createStartingInstances,
  generateInstanceId,
  CONCEPTS,
} from './game/concepts'
import { combine } from './game/combine'
import { Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen'
import Notification from './components/Notification'
import './App.css'

// Radio de detección adaptativo según tamaño de pantalla
const getHitRadius = () => {
  const width = window.innerWidth
  if (width < 480) return 60 // móvil pequeño
  if (width < 768) return 75 // tablet
  return 100 // desktop
}

const App = () => {
  const [instances, setInstances] = useState({})
  const [positions, setPositions] = useState({})
  const [hoverTargetId, setHoverTargetId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    position: { x: 0, y: 0 },
  })
  const [zIndexes, setZIndexes] = useState({})
  const [hitRadius, setHitRadius] = useState(getHitRadius())

  const zIndexCounter = useRef(1000)
  const combineAudioRef = useRef(null)
  const failAudioRef = useRef(null)
  const pressBubbleAudioRef = useRef(null)
  const soundBeforeCombiningAudioRef = useRef(null)

  // Actualizar hit radius en resize
  useEffect(() => {
    const handleResize = () => {
      setHitRadius(getHitRadius())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const combineAudio = new Audio('/sounds/success.mp3')
    combineAudio.volume = 0.4
    combineAudio.preload = 'auto'

    const failAudio = new Audio('/sounds/fail.mp3')
    failAudio.volume = 0.4
    failAudio.preload = 'auto'

    const pressBubbleAudio = new Audio('/sounds/pressBubble.mp3')
    pressBubbleAudio.volume = 0.5
    pressBubbleAudio.preload = 'auto'

    const soundBeforeCombiningAudio = new Audio(
      '/sounds/soundBeforeCombining.mp3',
    )
    soundBeforeCombiningAudio.volume = 0.4
    soundBeforeCombiningAudio.preload = 'auto'

    combineAudioRef.current = combineAudio
    failAudioRef.current = failAudio
    pressBubbleAudioRef.current = pressBubbleAudio
    soundBeforeCombiningAudioRef.current = soundBeforeCombiningAudio
  }, [])

  const playCombineSound = () => {
    const a = combineAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  const playFailSound = () => {
    const a = failAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  const playPressBubbleSound = () => {
    const a = pressBubbleAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  const playSoundBeforeCombining = () => {
    const a = soundBeforeCombiningAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  const showNotification = (message, position) => {
    setNotification({ isVisible: true, message, position })
  }

  const hideNotification = () => {
    setNotification({ isVisible: false, message: '', position: { x: 0, y: 0 } })
  }

  const draggingRef = useRef({
    id: null,
    offsetX: 0,
    offsetY: 0,
  })

  // Calcular radio adaptativo según tamaño de pantalla
  const getCircleRadius = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const minDimension = Math.min(width, height)
    
    if (width < 480) {
      return Math.min(minDimension * 0.28, 120) // móvil pequeño
    } else if (width < 768) {
      return Math.min(minDimension * 0.32, 180) // tablet
    } else if (width < 1024) {
      return Math.min(minDimension * 0.35, 220) // tablet landscape
    }
    return 280 // desktop
  }

  // Helper para verificar si una posición está muy cerca del centro (panel MY BOARDS)
  const isPositionTooCloseToCenter = (x, y, centerX, centerY, minDistance) => {
    const distance = Math.hypot(x - centerX, y - centerY)
    return distance < minDistance
  }

  // Helper para generar posición aleatoria válida
  const generateRandomPosition = (centerX, centerY, minDistanceFromCenter, margin) => {
    const maxAttempts = 50
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const x = margin + Math.random() * (window.innerWidth - margin * 2)
      const y = margin + Math.random() * (window.innerHeight - margin * 2)
      
      if (!isPositionTooCloseToCenter(x, y, centerX, centerY, minDistanceFromCenter)) {
        return { x, y }
      }
      attempts++
    }
    
    // Fallback: posición en los bordes
    const side = Math.floor(Math.random() * 4)
    switch (side) {
      case 0: return { x: margin, y: centerY + minDistanceFromCenter }
      case 1: return { x: window.innerWidth - margin, y: centerY + minDistanceFromCenter }
      case 2: return { x: centerX + minDistanceFromCenter, y: margin }
      default: return { x: centerX + minDistanceFromCenter, y: window.innerHeight - margin }
    }
  }

  // Initial positions - crear instancias iniciales con posicionamiento aleatorio
  useEffect(() => {
    const startingInstances = createStartingInstances()
    setInstances(startingInstances)

    const positionInstances = () => {
      const newPositions = {}
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      
      // Distancia mínima del centro para no tocar el panel MY BOARDS
      const width = window.innerWidth
      const minDistanceFromCenter = width < 480 ? 180 : width < 768 ? 200 : width < 1024 ? 240 : 280
      
      // Margen desde los bordes
      const margin = width < 480 ? 80 : width < 768 ? 100 : 120

      const instanceIds = Object.keys(startingInstances)

      instanceIds.forEach((instanceId) => {
        newPositions[instanceId] = generateRandomPosition(
          centerX, 
          centerY, 
          minDistanceFromCenter, 
          margin
        )
      })

      setPositions(newPositions)
    }

    positionInstances()

    // Reposicionar en resize para evitar que las burbujas queden fuera de pantalla
    const handleResize = () => {
      positionInstances()
    }

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

    playCombineSound()

    const resultInstanceId = generateInstanceId()

    setInstances((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]
      delete next[bInstanceId]
      next[resultInstanceId] = {
        instanceId: resultInstanceId,
        conceptId: resultConceptId,
        isNewlyCombined: true, // 🌟 Marcar como recién combinado
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
    e.preventDefault()
    e.stopPropagation()
    playPressBubbleSound()

    const p = positions[instanceId]
    if (!p) return

    setDraggingId(instanceId)

    setZIndexes((prev) => ({
      ...prev,
      [instanceId]: zIndexCounter.current++,
    }))

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
        const next = {
          ...prev,
          [d.id]: { x, y },
        }
        const targetId = getHitTarget(d.id, next)
        setHoverTargetId(targetId)

        if (targetId) {
          // Mantener el dragging element por encima del target
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: zIndexCounter.current - 1, // target un nivel abajo
            [d.id]: zIndexCounter.current, // dragging element encima
          }))
        }

        return next
      })
    }

    const onUp = (e) => {
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

        playSoundBeforeCombining()

        setTimeout(() => {
          const combined = combineAndReplace(dragId, targetId, spawnPos)
          if (!combined) {
            playFailSound()
            showNotification(
              'Too complex for demo! Go play in a board!',
              spawnPos,
            )

            setTimeout(() => {
              setZIndexes((prevZ) => {
                const next = { ...prevZ }
                delete next[dragId]
                delete next[targetId]
                return next
              })
            }, 1500)
          } else {
            setZIndexes((prevZ) => {
              const next = { ...prevZ }
              delete next[dragId]
              delete next[targetId]
              return next
            })
          }
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
  }, [instances, positions, hitRadius])

  return (
    <>
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        position={notification.position}
        onClose={hideNotification}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomeScreen
              instances={instances}
              positions={positions}
              onPointerDownBubble={onPointerDownBubble}
              hoverTargetId={hoverTargetId}
              draggingId={draggingId}
              zIndexes={zIndexes}
            />
          }
        />
      </Routes>
    </>
  )
}

export default App