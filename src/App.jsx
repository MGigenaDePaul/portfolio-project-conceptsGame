import { useState, useEffect, useRef } from 'react'
import { createStartingInstances, generateInstanceId } from './game/concepts'
import { combine } from './game/combine'
import { Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen'
import Notification from './components/Notification'
import './App.css'

const getHitRadius = () => {
  const width = window.innerWidth
  if (width < 480) return 60
  if (width < 768) return 75
  return 100
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
  const [isCombining, setIsCombining] = useState(false)

  const combineAudioRef = useRef(null)
  const failAudioRef = useRef(null)
  const pressBubbleAudioRef = useRef(null)
  const soundBeforeCombiningAudioRef = useRef(null)

  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 })

  useEffect(() => {
    const handleResize = () => setHitRadius(getHitRadius())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const play = (ref) => {
    const a = ref.current
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

  const isPositionTooCloseToCenter = (x, y, centerX, centerY, minDistance) => {
    const distance = Math.hypot(x - centerX, y - centerY)
    return distance < minDistance
  }

  const isPositionTooCloseToOthers = (
    x,
    y,
    existingPositions,
    minDistance = 120,
  ) => {
    for (const pos of Object.values(existingPositions)) {
      const distance = Math.hypot(x - pos.x, y - pos.y)
      if (distance < minDistance) return true
    }
    return false
  }

  const generateRandomPositionInQuadrant = (
    quadrant,
    centerX,
    centerY,
    minDistanceFromCenter,
    margin,
    existingPositions = {},
  ) => {
    const maxAttempts = 100
    let attempts = 0

    let minX, maxX, minY, maxY

    switch (quadrant) {
      case 0: // top left
        minX = margin
        maxX = centerX - minDistanceFromCenter / 1.5
        minY = margin
        maxY = centerY - minDistanceFromCenter / 1.5
        break
      case 1: // top right
        minX = centerX + minDistanceFromCenter / 1.5
        maxX = window.innerWidth - margin
        minY = margin
        maxY = centerY - minDistanceFromCenter / 1.5
        break
      case 2: // bottom-left
        minX = margin
        maxX = centerX - minDistanceFromCenter / 1.5
        minY = centerY + minDistanceFromCenter / 1.5
        maxY = window.innerHeight - margin
        break
      case 3: // bottom-right
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

    const width = window.innerWidth
    const minDistanceBetweenBubbles =
      width < 480 ? 100 : width < 768 ? 110 : 120

    while (attempts < maxAttempts) {
      const x = minX + Math.random() * (maxX - minX)
      const y = minY + Math.random() * (maxY - minY)

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

    const fallbackX = minX + (maxX - minX) * (0.3 + Math.random() * 0.4)
    const fallbackY = minY + (maxY - minY) * (0.3 + Math.random() * 0.4)
    return { x: fallbackX, y: fallbackY }
  }

  useEffect(() => {
    const startingInstances = createStartingInstances()
    setInstances(startingInstances)

    const positionInstances = () => {
      const newPositions = {}
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      const width = window.innerWidth
      const minDistanceFromCenter =
        width < 480 ? 180 : width < 768 ? 200 : width < 1024 ? 240 : 280
      const margin = width < 480 ? 80 : width < 768 ? 100 : 120

      const instanceIds = Object.keys(startingInstances)

      instanceIds.forEach((instanceId, index) => {
        const quadrant = index % 4
        newPositions[instanceId] = generateRandomPositionInQuadrant(
          quadrant,
          centerX,
          centerY,
          minDistanceFromCenter,
          margin,
          newPositions,
        )
      })

      setPositions(newPositions)
    }

    positionInstances()

    const handleResize = () => positionInstances()
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
      next[resultInstanceId] = { x: spawnPos.x, y: spawnPos.y } // normalmente donde estaba la burbuja arrastrada
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
      offsetX: e.clientX - p.x, // Sirven para que la burbuja no salte al cursor cuando la agarrás desde un costado
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
      console.log('no hay drag', d)
      if (!d.id) return

      const dragId = d.id
      draggingRef.current.id = null

      setDraggingId(null)
      setHoverTargetId(null)

      // Reviso si al soltar estoy cerca de alguna burbuja para combinar
      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev)

        // Caso A: no hay target cerca → solo suelto y limpio z-index
        if (!targetId) {
          setZIndexes((prevZ) => {
            const next = { ...prevZ }
            delete next[dragId]
            return next
          })
          return prev // nuevo estado de positions, no quiero cambiar las posiciones
        }

        // Caso B: hay target → preparo intento de combinación
        const spawnPos = prev[dragId]
        if (!spawnPos) return prev

        // Feedback + lock para que no pueda tocar mientras "combina"
        play(soundBeforeCombiningAudioRef)
        setIsCombining(true)

        // Espero 700ms (animación) y recién ahí intento combinar
        setTimeout(() => {
          const combined = combineAndReplace(dragId, targetId, spawnPos)

          // Si falla: sonido fail + notificación + unlock después de 2s
          if (!combined) {
            play(failAudioRef)
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
              setIsCombining(false)
            }, 2000)
          } else {
            // Si funciona: limpio z-index y unlock inmediato
            setZIndexes((prevZ) => {
              const next = { ...prevZ }
              delete next[dragId]
              delete next[targetId]
              return next
            })
            setIsCombining(false)
          }
        }, 700)

        // 11) Importante: este setPositions no cambia posiciones acá
        // (solo lo uso como lugar para decidir qué hacer al soltar)
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
