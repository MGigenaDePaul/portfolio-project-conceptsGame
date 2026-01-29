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
  // 🔧 FIX BUG 3: Track if combination is in progress
  const [isCombining, setIsCombining] = useState(false)

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

  // Helper para verificar si una posición colisiona con otras burbujas ya posicionadas
  const isPositionTooCloseToOthers = (
    x,
    y,
    existingPositions,
    minDistance = 120,
  ) => {
    for (const pos of Object.values(existingPositions)) {
      const distance = Math.hypot(x - pos.x, y - pos.y)
      if (distance < minDistance) {
        return true // Demasiado cerca de otra burbuja
      }
    }
    return false // Posición válida
  }

  // Helper para generar posición aleatoria válida en un cuadrante específico
  const generateRandomPositionInQuadrant = (
    quadrant,
    centerX,
    centerY,
    minDistanceFromCenter,
    margin,
    existingPositions = {},
  ) => {
    const maxAttempts = 100 // Más intentos para encontrar una posición válida
    let attempts = 0

    // Definir límites según el cuadrante
    let minX, maxX, minY, maxY

    switch (quadrant) {
      case 0: // Top-Left
        minX = margin
        maxX = centerX - minDistanceFromCenter / 1.5
        minY = margin
        maxY = centerY - minDistanceFromCenter / 1.5
        break
      case 1: // Top-Right
        minX = centerX + minDistanceFromCenter / 1.5
        maxX = window.innerWidth - margin
        minY = margin
        maxY = centerY - minDistanceFromCenter / 1.5
        break
      case 2: // Bottom-Left
        minX = margin
        maxX = centerX - minDistanceFromCenter / 1.5
        minY = centerY + minDistanceFromCenter / 1.5
        maxY = window.innerHeight - margin
        break
      case 3: // Bottom-Right
        minX = centerX + minDistanceFromCenter / 1.5
        maxX = window.innerWidth - margin
        minY = centerY + minDistanceFromCenter / 1.5
        maxY = window.innerHeight - margin
        break
      default:
        minX = margin
        maxX = window.innerWidth - margin
        minY = margin
        maxY = window.innerHeight - margin
    }

    // Distancia mínima entre burbujas (responsive)
    const width = window.innerWidth
    const minDistanceBetweenBubbles =
      width < 480 ? 100 : width < 768 ? 110 : 120

    while (attempts < maxAttempts) {
      const x = minX + Math.random() * (maxX - minX)
      const y = minY + Math.random() * (maxY - minY)

      // Verificar que no esté cerca del centro ni de otras burbujas
      if (
        !isPositionTooCloseToCenter(
          x,
          y,
          centerX,
          centerY,
          minDistanceFromCenter,
        ) &&
        !isPositionTooCloseToOthers(
          x,
          y,
          existingPositions,
          minDistanceBetweenBubbles,
        )
      ) {
        return { x, y }
      }
      attempts++
    }

    // Fallback: posición en el borde del cuadrante con algo de aleatorización
    const fallbackX = minX + (maxX - minX) * (0.3 + Math.random() * 0.4)
    const fallbackY = minY + (maxY - minY) * (0.3 + Math.random() * 0.4)
    return { x: fallbackX, y: fallbackY }
  }

  // Initial positions - crear instancias iniciales con posicionamiento balanceado y sin colisiones
  useEffect(() => {
    const startingInstances = createStartingInstances()
    setInstances(startingInstances)

    const positionInstances = () => {
      const newPositions = {}
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      // Distancia mínima del centro para no tocar el panel MY BOARDS
      const width = window.innerWidth
      const minDistanceFromCenter =
        width < 480 ? 180 : width < 768 ? 200 : width < 1024 ? 240 : 280

      // Margen desde los bordes
      const margin = width < 480 ? 80 : width < 768 ? 100 : 120

      const instanceIds = Object.keys(startingInstances)

      // Distribuir burbujas en cuadrantes de manera balanceada, sin colisiones
      instanceIds.forEach((instanceId, index) => {
        const quadrant = index % 4 // 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right

        newPositions[instanceId] = generateRandomPositionInQuadrant(
          quadrant,
          centerX,
          centerY,
          minDistanceFromCenter,
          margin,
          newPositions, // Pasar posiciones existentes para evitar colisiones
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
    // 🔧 FIX BUG 3: Prevent interaction during combination
    if (isCombining) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    e.preventDefault()
    e.stopPropagation()
    playPressBubbleSound()

    const p = positions[instanceId]
    if (!p) return

    setDraggingId(instanceId)

    // 🔧 FIX BUG 1 & 2: Set dragging element to very high z-index
    setZIndexes((prev) => ({
      ...prev,
      [instanceId]: 9999,
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

        // 🔧 FIX BUG 2: Keep dragging element always on top
        if (targetId) {
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: 100, // target lower
            [d.id]: 9999, // dragging always highest
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

        // 🔧 FIX BUG 3: Lock elements during combination
        setIsCombining(true)

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
              // 🔧 FIX BUG 3: Unlock after notification time
              setIsCombining(false)
            }, 2000) // Wait for notification to disappear
          } else {
            setZIndexes((prevZ) => {
              const next = { ...prevZ }
              delete next[dragId]
              delete next[targetId]
              return next
            })
            // 🔧 FIX BUG 3: Unlock after successful combination
            setIsCombining(false)
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
  }, [instances, positions, hitRadius, isCombining])

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
