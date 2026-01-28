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

const HIT_RADIUS = 100

const App = () => {
  // Ahora usamos instances en vez de discoveredIds
  const [instances, setInstances] = useState({}) // { instanceId: { instanceId, conceptId } }
  const [positions, setPositions] = useState({})
  const [hoverTargetId, setHoverTargetId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    position: { x: 0, y: 0 },
  })
  const [zIndexes, setZIndexes] = useState({})

  const zIndexCounter = useRef(1000)
  const combineAudioRef = useRef(null)
  const failAudioRef = useRef(null)
  const pressBubbleAudioRef = useRef(null)
  const soundBeforeCombiningAudioRef = useRef(null)

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

  // Initial positions - crear instancias iniciales
  useEffect(() => {
    const startingInstances = createStartingInstances()
    setInstances(startingInstances)

    const newPositions = {}
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const radius = 280

    const instanceIds = Object.keys(startingInstances)

    // Barajar el array para orden aleatorio
    const shuffledIds = instanceIds.sort(() => Math.random() - 0.5)

    shuffledIds.forEach((instanceId, index) => {
      const angle = (index / shuffledIds.length) * Math.PI * 2
      newPositions[instanceId] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      }
    })

    setPositions(newPositions)
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
      if (dist < HIT_RADIUS && dist < bestDist) {
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

    // Combinar usando los conceptIds
    const resultConceptId = combine(aInstance.conceptId, bInstance.conceptId)
    if (!resultConceptId) return false

    playCombineSound()

    // Crear nueva instancia del resultado
    const resultInstanceId = generateInstanceId()

    setInstances((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]
      delete next[bInstanceId]
      next[resultInstanceId] = {
        instanceId: resultInstanceId,
        conceptId: resultConceptId,
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
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: 0,
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
            // ❌ COMBINACIÓN FALLÓ
            playFailSound()
            showNotification(
              'Too complex for demo! Go play in a board!',
              spawnPos,
            )

            // ⭐ MANTENER z-index alto por más tiempo cuando falla
            setTimeout(() => {
              setZIndexes((prevZ) => {
                const next = { ...prevZ }
                delete next[dragId]
                delete next[targetId]
                return next
              })
            }, 1500) // despues de 1.5 seg limpiar z-indexes
          } else {
            // ✅ COMBINACIÓN EXITOSA - limpiar inmediatamente
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
  }, [instances, positions])

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
