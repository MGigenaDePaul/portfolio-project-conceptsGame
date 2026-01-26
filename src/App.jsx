import { useState, useEffect, useRef } from 'react'
import { STARTING_CONCEPT_IDS } from './game/concepts'
import { combine } from './game/combine'
import { Routes, Route } from 'react-router-dom'
import HomeScreen from './pages/HomeScreen'
import './App.css'

const HIT_RADIUS = 46 // qué tan cerca tiene que estar para "drop encima"

const App = () => {
  const [discoveredIds, setDiscoveredIds] = useState(STARTING_CONCEPT_IDS)
  const [positions, setPositions] = useState({})
  const [hoverTargetId, setHoverTargetId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  const combineAudioRef = useRef(null)
  const failAudioRef = useRef(null)

  useEffect(() => {
    const combineAudio = new Audio('/sounds/success.mp3')
    combineAudio.volume = 0.6
    combineAudio.preload = 'auto'

    const failAudio = new Audio('/sounds/fail.mp3')
    failAudio.volume = 0.4
    failAudio.preload = 'auto'

    combineAudioRef.current = combineAudio
    failAudioRef.current = failAudio
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

  // dragging state
  const draggingRef = useRef({
    id: null, // ahora mismo no arrastro ningun bubble
    offsetX: 0, // offsetX y offsetY guardan donde agarre el bubble, ejemplo --> Bubble está en (200, 200) Mouse toca en (215, 210)
    offsetY: 0, // entonces offsetX = 215 - 200 = 15 offsetY = 210 - 200 = 10
  })

  // initial positions
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

    let best = null // todavia no hay target
    let bestDist = Infinity // distancia del mejor candidato

    for (const otherId of discoveredIds) {
      if (otherId === dragId) continue // No tiene sentido medir distancia entre un bubble y sí mismo, por lo tanto, continue
      const q = currentPositions[otherId]
      if (!q) continue // si no tengo posicion para este bubble, ignoralo

      const dist = Math.hypot(p.x - q.x, p.y - q.y) // "calcular DISTANCIA entre p y q" p es la posicion del bubble que soltas, q es la posicion del otro bubble del tablero
      if (dist < HIT_RADIUS && dist < bestDist) {
        bestDist = dist
        best = otherId
      }
    }

    return best
  }

  // combina y reemplaza: borra a y b, crea result
  const combineAndReplace = (aId, bId, spawnPos) => {
    // aId es bubble arrastrado, bId bubble target y spawnPost es la posicion donde quiero que aparezca el resultado (normalmente donde la posicion del drag al soltar)
    const resultId = combine(aId, bId)
    if (!resultId) return false

    playCombineSound()

    // 1) actualizar discoveredIds (sacar a y b, meter result si no está)
    setDiscoveredIds((prev) => {
      const filtered = prev.filter((id) => id !== aId && id !== bId) // aca se saca a y b
      return filtered.includes(resultId) ? filtered : [...filtered, resultId] // resultId="steam" no estaba por ejemplo → lo agrega
    })

    // 2) actualizar posiciones (borrar a y b, setear result en spawnPos)
    setPositions((prev) => {
      const next = { ...prev } // copia del objeto
      delete next[aId] // borrar posicion a
      delete next[bId] // borrar posicion b

      next[resultId] = { x: spawnPos.x, y: spawnPos.y } // crear posicion del resultado en spawnPros -> next = {earth:{x: 300, y: 200}}
      return next
    })

    return true
  }

  const onPointerDownBubble = (id) => (e) => {
    // tocamos el bubble, arranquemos el drag
    e.preventDefault()
    e.stopPropagation()
    /* stopPropagation() 
        Evita que el evento:
          suba al contenedor padre
          dispare otros handlers (por ejemplo click global) */

    console.log('POINTER DOWN', {
      id,
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      target: e.currentTarget,
    })

    const p = positions[id] // lee posicion actual del bubble
    if (!p) return

    setDraggingId(id)

    e.currentTarget.setPointerCapture?.(e.pointerId) // setPointerCapture() asegura que el elemento reciba eventos aunque el puntero salga

    draggingRef.current = {
      id, // bubble que estoy arrastrando ahora
      offsetX: e.clientX - p.x, // ejemplo para estos offsets -> Bubble está en (200,200), Mouse toca en (215,210)
      offsetY: e.clientY - p.y, // ENTONCES offsetX = 15 y offsetY=10, luego si el mouse es (300,300) x = 300 - 15 = 285, y = 300 - 10 = 290
    }
  }

  useEffect(() => {
    const onMove = (e) => {
      const d = draggingRef.current
      if (!d.id) return

      const x = e.clientX - d.offsetX // lo que el mouse toca en x menos la posicion del dragging en x
      const y = e.clientY - d.offsetY // lo mismo que pero en la posicion y

      setPositions((prev) => {
        const next = {
          ...prev,
          [d.id]: { x, y },
        }
        const targetId = getHitTarget(d.id, next)
        setHoverTargetId(targetId)

        return next
      })
    }

    const onUp = (e) => {
      // soltar el bubble
      const d = draggingRef.current
      if (!d.id) return

      // guardar que bubble era y cortar el drag
      const dragId = d.id
      draggingRef.current.id = null

      setDraggingId(null)
      setHoverTargetId(null)
      // MUY IMPORTANTE:
      // usamos setPositions callback para tener el "estado más nuevo" y no uno viejo.
      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev) // hay algun bubble cerca para combinar? si no, no pasa nada, si sí, seguimos
        if (!targetId) return prev

        // obtener donde solte el bubble
        const spawnPos = prev[dragId]
        if (!spawnPos) return prev

        // combinamos (esto hará setDiscoveredIds + setPositions extra)
        // y acá devolvemos prev tal cual, porque el cambio real lo hace combineAndReplace.
        const combine = combineAndReplace(dragId, targetId, spawnPos)
        if (!combine) {
          playFailSound()
        }
        return prev
      })
    }

    window.addEventListener('pointermove', onMove) // cada vez que se mueva el puntero, avisame
    window.addEventListener('pointerup', onUp) // cuando el puntero se suelte, avisame

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [discoveredIds, positions]) // lo dejamos así por ahora (funciona perfecto)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomeScreen
            discoveredIds={discoveredIds}
            positions={positions}
            onPointerDownBubble={onPointerDownBubble}
            hoverTargetId={hoverTargetId}
            draggingId={draggingId}
          />
        }
      />
    </Routes>
  )
}

export default App
