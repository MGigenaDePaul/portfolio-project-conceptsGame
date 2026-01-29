/**
 * ============================================
 * APP.JSX - COMPONENTE PRINCIPAL
 * ============================================
 * 
 * Este es el componente raíz de Concepts Game.
 * Maneja toda la lógica del drag & drop, combinaciones,
 * posicionamiento de burbujas, y estados del juego.
 * 
 * Funcionalidades principales:
 * - Drag & drop de elementos (burbujas)
 * - Sistema de combinaciones (recetas)
 * - Detección de colisiones entre burbujas
 * - Posicionamiento inteligente (evita solapamientos)
 * - Manejo de z-index para superposición correcta
 * - Sistema de notificaciones
 * - Efectos de sonido
 * - Responsive design
 */

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

/**
 * ============================================
 * HELPER: RADIO DE DETECCIÓN ADAPTATIVO
 * ============================================
 * Calcula el radio de detección para el drag & drop
 * basado en el tamaño de la pantalla.
 * 
 * Más pequeña la pantalla = menor radio (más preciso)
 * Mayor pantalla = mayor radio (más fácil combinar)
 */
const getHitRadius = () => {
  const width = window.innerWidth
  if (width < 480) return 60   // móvil pequeño
  if (width < 768) return 75   // tablet
  return 100                    // desktop
}

/**
 * ============================================
 * COMPONENTE PRINCIPAL: APP
 * ============================================
 */
const App = () => {
  // ==========================================
  // ESTADOS PRINCIPALES DEL JUEGO
  // ==========================================
  
  /**
   * instances: Objeto que contiene todas las burbujas activas
   * Estructura: { instanceId: { instanceId, conceptId, isNewlyCombined } }
   * - instanceId: ID único de la burbuja (ej: "instance-0")
   * - conceptId: Tipo de concepto (ej: "fire", "water")
   * - isNewlyCombined: Flag para animación rápida
   */
  const [instances, setInstances] = useState({})
  
  /**
   * positions: Posiciones (x, y) de cada burbuja en la pantalla
   * Estructura: { instanceId: { x: number, y: number } }
   */
  const [positions, setPositions] = useState({})
  
  /**
   * hoverTargetId: ID de la burbuja sobre la que está el elemento arrastrado
   * Se usa para mostrar el efecto visual de "drop-target"
   */
  const [hoverTargetId, setHoverTargetId] = useState(null)
  
  /**
   * draggingId: ID de la burbuja que se está arrastrando actualmente
   * null cuando no hay drag activo
   */
  const [draggingId, setDraggingId] = useState(null)
  
  /**
   * notification: Estado de la notificación mostrada al usuario
   * - isVisible: boolean - si la notificación está visible
   * - message: string - mensaje a mostrar
   * - position: { x, y } - posición donde aparece
   */
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    position: { x: 0, y: 0 },
  })
  
  /**
   * zIndexes: Controla el z-index dinámico de cada burbuja
   * Estructura: { instanceId: number }
   * Permite que la burbuja arrastrada aparezca encima de todo
   */
  const [zIndexes, setZIndexes] = useState({})
  
  /**
   * hitRadius: Radio de detección para combinar burbujas
   * Se actualiza cuando la ventana cambia de tamaño
   */
  const [hitRadius, setHitRadius] = useState(getHitRadius())
  
  /**
   * isCombining: Flag que previene interacción durante animaciones
   * Evita bugs cuando el usuario intenta arrastrar durante una combinación
   */
  const [isCombining, setIsCombining] = useState(false)

  // ==========================================
  // REFS PARA AUDIO Y DRAG STATE
  // ==========================================
  
  /**
   * zIndexCounter: Contador incremental para asignar z-indexes únicos
   * No se usa directamente, pero mantiene el patrón del código original
   */
  const zIndexCounter = useRef(1000)
  
  /**
   * Referencias a elementos de audio precargados
   * Se mantienen en refs para reutilizarlos sin recargar
   */
  const combineAudioRef = useRef(null)           // Sonido de éxito
  const failAudioRef = useRef(null)              // Sonido de fallo
  const pressBubbleAudioRef = useRef(null)       // Sonido al presionar
  const soundBeforeCombiningAudioRef = useRef(null) // Sonido antes de combinar

  // ==========================================
  // EFFECT: ACTUALIZAR HIT RADIUS EN RESIZE
  // ==========================================
  
  /**
   * Escucha cambios en el tamaño de la ventana y actualiza
   * el radio de detección para mantener la jugabilidad óptima
   */
  useEffect(() => {
    const handleResize = () => {
      setHitRadius(getHitRadius())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ==========================================
  // EFFECT: PRECARGAR ARCHIVOS DE AUDIO
  // ==========================================
  
  /**
   * Carga y configura todos los efectos de sonido al montar el componente
   * El preload='auto' asegura que estén listos antes de usarse
   */
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

    // Guardar referencias para reutilizar
    combineAudioRef.current = combineAudio
    failAudioRef.current = failAudio
    pressBubbleAudioRef.current = pressBubbleAudio
    soundBeforeCombiningAudioRef.current = soundBeforeCombiningAudio
  }, [])

  // ==========================================
  // FUNCIONES DE AUDIO
  // ==========================================
  
  /**
   * Reproduce el sonido de combinación exitosa
   * currentTime = 0 permite reproducir aunque ya esté sonando
   */
  const playCombineSound = () => {
    const a = combineAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {}) // catch previene errores en navegadores con autoplay bloqueado
  }

  /**
   * Reproduce el sonido de fallo (combinación inválida)
   */
  const playFailSound = () => {
    const a = failAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  /**
   * Reproduce el sonido al presionar una burbuja
   */
  const playPressBubbleSound = () => {
    const a = pressBubbleAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  /**
   * Reproduce el sonido previo a la combinación
   * Da feedback al usuario de que se detectó un drop válido
   */
  const playSoundBeforeCombining = () => {
    const a = soundBeforeCombiningAudioRef.current
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
  }

  // ==========================================
  // FUNCIONES DE NOTIFICACIÓN
  // ==========================================
  
  /**
   * Muestra una notificación en pantalla
   * @param {string} message - Mensaje a mostrar
   * @param {object} position - Posición { x, y } donde aparece
   */
  const showNotification = (message, position) => {
    setNotification({ isVisible: true, message, position })
  }

  /**
   * Oculta la notificación actual
   */
  const hideNotification = () => {
    setNotification({ isVisible: false, message: '', position: { x: 0, y: 0 } })
  }

  // ==========================================
  // REF PARA ESTADO DE DRAG
  // ==========================================
  
  /**
   * Almacena el estado actual del drag en una ref (no re-renderiza)
   * - id: instanceId de la burbuja siendo arrastrada
   * - offsetX/Y: Diferencia entre el mouse y el centro de la burbuja
   *   (permite arrastrar desde cualquier punto sin que "salte")
   */
  const draggingRef = useRef({
    id: null,
    offsetX: 0,
    offsetY: 0,
  })

  // ==========================================
  // HELPER: CALCULAR RADIO DE CÍRCULO
  // ==========================================
  
  /**
   * NOTA: Esta función no se usa actualmente, pero está preparada
   * para futuras funcionalidades (ej: disponer burbujas en círculo)
   */
  const getCircleRadius = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const minDimension = Math.min(width, height)
    
    if (width < 480) {
      return Math.min(minDimension * 0.28, 120)
    } else if (width < 768) {
      return Math.min(minDimension * 0.32, 180)
    } else if (width < 1024) {
      return Math.min(minDimension * 0.35, 220)
    }
    return 280
  }

  // ==========================================
  // HELPER: VERIFICAR PROXIMIDAD AL CENTRO
  // ==========================================
  
  /**
   * Verifica si una posición está demasiado cerca del centro de la pantalla
   * Se usa para evitar que las burbujas aparezcan sobre el panel "MY BOARDS"
   * 
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} centerX - Centro X de la pantalla
   * @param {number} centerY - Centro Y de la pantalla
   * @param {number} minDistance - Distancia mínima requerida
   * @returns {boolean} - true si está demasiado cerca
   */
  const isPositionTooCloseToCenter = (x, y, centerX, centerY, minDistance) => {
    const distance = Math.hypot(x - centerX, y - centerY)
    return distance < minDistance
  }

  // ==========================================
  // HELPER: VERIFICAR COLISIÓN CON OTRAS BURBUJAS
  // ==========================================
  
  /**
   * Verifica si una posición está demasiado cerca de otras burbujas existentes
   * Previene que las burbujas se superpongan al generarse
   * 
   * @param {number} x - Coordenada X a verificar
   * @param {number} y - Coordenada Y a verificar
   * @param {object} existingPositions - Posiciones actuales de otras burbujas
   * @param {number} minDistance - Distancia mínima entre burbujas (default: 120px)
   * @returns {boolean} - true si hay colisión
   */
  const isPositionTooCloseToOthers = (x, y, existingPositions, minDistance = 120) => {
    for (const pos of Object.values(existingPositions)) {
      const distance = Math.hypot(x - pos.x, y - pos.y)
      if (distance < minDistance) {
        return true // Demasiado cerca de otra burbuja
      }
    }
    return false // Posición válida
  }

  // ==========================================
  // HELPER: GENERAR POSICIÓN ALEATORIA EN CUADRANTE
  // ==========================================
  
  /**
   * Genera una posición aleatoria válida dentro de un cuadrante específico
   * de la pantalla, evitando colisiones con otras burbujas y el centro.
   * 
   * La pantalla se divide en 4 cuadrantes:
   * 0 = Top-Left     1 = Top-Right
   * 2 = Bottom-Left  3 = Bottom-Right
   * 
   * Esto garantiza una distribución balanceada de las burbujas iniciales.
   * 
   * @param {number} quadrant - Cuadrante (0-3)
   * @param {number} centerX - Centro X de la pantalla
   * @param {number} centerY - Centro Y de la pantalla
   * @param {number} minDistanceFromCenter - Distancia mínima del centro
   * @param {number} margin - Margen desde los bordes de la pantalla
   * @param {object} existingPositions - Posiciones ya ocupadas
   * @returns {object} - Posición { x, y }
   */
  const generateRandomPositionInQuadrant = (
    quadrant,
    centerX,
    centerY,
    minDistanceFromCenter,
    margin,
    existingPositions = {}
  ) => {
    const maxAttempts = 100 // Intentos máximos para encontrar posición válida
    let attempts = 0

    // Definir límites del cuadrante
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
    const minDistanceBetweenBubbles = width < 480 ? 100 : width < 768 ? 110 : 120

    // Intentar encontrar una posición válida
    while (attempts < maxAttempts) {
      const x = minX + Math.random() * (maxX - minX)
      const y = minY + Math.random() * (maxY - minY)

      // Verificar que no esté cerca del centro ni de otras burbujas
      if (
        !isPositionTooCloseToCenter(x, y, centerX, centerY, minDistanceFromCenter) &&
        !isPositionTooCloseToOthers(x, y, existingPositions, minDistanceBetweenBubbles)
      ) {
        return { x, y } // Posición válida encontrada
      }
      attempts++
    }

    // Fallback: Si no se encontró posición válida después de 100 intentos,
    // devolver una posición semi-aleatoria en el centro del cuadrante
    const fallbackX = minX + (maxX - minX) * (0.3 + Math.random() * 0.4)
    const fallbackY = minY + (maxY - minY) * (0.3 + Math.random() * 0.4)
    return { x: fallbackX, y: fallbackY }
  }

  // ==========================================
  // EFFECT: POSICIONAMIENTO INICIAL
  // ==========================================
  
  /**
   * Crea las burbujas iniciales y las posiciona en la pantalla
   * al montar el componente.
   * 
   * Este effect también maneja el reposicionamiento cuando
   * la ventana cambia de tamaño (responsive).
   */
  useEffect(() => {
    // Crear instancias iniciales (2 de cada elemento básico)
    const startingInstances = createStartingInstances()
    setInstances(startingInstances)

    /**
     * Función que calcula y asigna posiciones a todas las burbujas
     * Se ejecuta en mount y en cada resize
     */
    const positionInstances = () => {
      const newPositions = {}
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      // Distancia mínima del centro (responsive)
      // Más grande en pantallas grandes para dejar espacio al panel MY BOARDS
      const width = window.innerWidth
      const minDistanceFromCenter =
        width < 480 ? 180 : width < 768 ? 200 : width < 1024 ? 240 : 280

      // Margen desde los bordes de la pantalla
      const margin = width < 480 ? 80 : width < 768 ? 100 : 120

      const instanceIds = Object.keys(startingInstances)

      // Distribuir burbujas en cuadrantes de manera balanceada
      instanceIds.forEach((instanceId, index) => {
        // Alternar entre cuadrantes: 0, 1, 2, 3, 0, 1, 2, 3...
        const quadrant = index % 4

        newPositions[instanceId] = generateRandomPositionInQuadrant(
          quadrant,
          centerX,
          centerY,
          minDistanceFromCenter,
          margin,
          newPositions // Pasar posiciones existentes para evitar colisiones
        )
      })

      setPositions(newPositions)
    }

    // Posicionar burbujas inicialmente
    positionInstances()

    // Reposicionar en resize para evitar que queden fuera de pantalla
    const handleResize = () => {
      positionInstances()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ==========================================
  // FUNCIÓN: DETECTAR TARGET AL ARRASTRAR
  // ==========================================
  
  /**
   * Encuentra la burbuja más cercana al elemento arrastrado
   * que esté dentro del radio de detección (hitRadius)
   * 
   * @param {string} dragId - ID de la burbuja siendo arrastrada
   * @param {object} currentPositions - Posiciones actuales de todas las burbujas
   * @returns {string|null} - ID de la burbuja más cercana o null
   */
  const getHitTarget = (dragId, currentPositions) => {
    const p = currentPositions[dragId]
    if (!p) return null

    let best = null
    let bestDist = Infinity

    // Buscar la burbuja más cercana
    for (const otherId of Object.keys(instances)) {
      if (otherId === dragId) continue // Ignorar la burbuja arrastrada
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

  // ==========================================
  // FUNCIÓN: COMBINAR Y REEMPLAZAR BURBUJAS
  // ==========================================
  
  /**
   * Intenta combinar dos burbujas y reemplazarlas con el resultado
   * 
   * Flujo:
   * 1. Obtener los conceptos de ambas burbujas
   * 2. Buscar receta en el sistema de combinaciones
   * 3. Si existe: crear nueva burbuja con el resultado
   * 4. Eliminar las burbujas originales
   * 5. Reproducir sonido de éxito
   * 
   * @param {string} aInstanceId - ID de la primera burbuja
   * @param {string} bInstanceId - ID de la segunda burbuja
   * @param {object} spawnPos - Posición donde aparecerá el resultado
   * @returns {boolean} - true si la combinación fue exitosa
   */
  const combineAndReplace = (aInstanceId, bInstanceId, spawnPos) => {
    const aInstance = instances[aInstanceId]
    const bInstance = instances[bInstanceId]

    if (!aInstance || !bInstance) return false

    // Intentar combinar usando el sistema de recetas
    const resultConceptId = combine(aInstance.conceptId, bInstance.conceptId)
    if (!resultConceptId) return false // No hay receta para esta combinación

    playCombineSound()

    // Generar ID único para la nueva burbuja
    const resultInstanceId = generateInstanceId()

    // Actualizar estado de instancias
    setInstances((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]  // Eliminar burbuja A
      delete next[bInstanceId]  // Eliminar burbuja B
      next[resultInstanceId] = {
        instanceId: resultInstanceId,
        conceptId: resultConceptId,
        isNewlyCombined: true, // Flag para animación rápida de spawn
      }
      return next
    })

    // Actualizar posiciones
    setPositions((prev) => {
      const next = { ...prev }
      delete next[aInstanceId]
      delete next[bInstanceId]
      next[resultInstanceId] = { x: spawnPos.x, y: spawnPos.y }
      return next
    })

    return true
  }

  // ==========================================
  // HANDLER: INICIAR DRAG
  // ==========================================
  
  /**
   * Se ejecuta cuando el usuario hace pointer down en una burbuja
   * Inicia el proceso de drag & drop
   * 
   * @param {string} instanceId - ID de la burbuja a arrastrar
   * @returns {function} - Event handler
   */
  const onPointerDownBubble = (instanceId) => (e) => {
    // PREVENCIÓN: No permitir drag durante animación de combinación
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

    // Marcar esta burbuja como la que se está arrastrando
    setDraggingId(instanceId)

    // Z-INDEX FIX: Asignar z-index muy alto para que aparezca encima de todo
    // Esto incluye el título, botones, y otras burbujas
    setZIndexes((prev) => ({
      ...prev,
      [instanceId]: 9999, // Valor muy alto para estar sobre todo
    }))

    // Pointer capture: hace que todos los eventos pointer vayan a este elemento
    // incluso si el mouse sale del elemento
    e.currentTarget.setPointerCapture?.(e.pointerId)

    // Guardar offset entre el mouse y el centro de la burbuja
    // Esto permite arrastrar desde cualquier punto sin que "salte"
    draggingRef.current = {
      id: instanceId,
      offsetX: e.clientX - p.x,
      offsetY: e.clientY - p.y,
    }
  }

  // ==========================================
  // EFFECT: MANEJO DE DRAG & DROP
  // ==========================================
  
  /**
   * Escucha eventos de mouse/touch para manejar el drag & drop
   * Se ejecuta en todo momento (no solo en la burbuja)
   */
  useEffect(() => {
    /**
     * HANDLER: Mover burbuja mientras se arrastra
     */
    const onMove = (e) => {
      const d = draggingRef.current
      if (!d.id) return // No hay drag activo

      // Calcular nueva posición basada en el mouse y el offset
      const x = e.clientX - d.offsetX
      const y = e.clientY - d.offsetY

      setPositions((prev) => {
        const next = {
          ...prev,
          [d.id]: { x, y },
        }
        
        // Detectar si hay una burbuja cercana (target potencial)
        const targetId = getHitTarget(d.id, next)
        setHoverTargetId(targetId)

        // Z-INDEX FIX: Mantener elemento arrastrado siempre encima
        if (targetId) {
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: 100,    // Target más bajo
            [d.id]: 9999,       // Dragging siempre el más alto
          }))
        }

        return next
      })
    }

    /**
     * HANDLER: Soltar burbuja (drop)
     */
    const onUp = (e) => {
      const d = draggingRef.current
      if (!d.id) return

      const dragId = d.id
      draggingRef.current.id = null // Limpiar estado de drag

      setDraggingId(null)
      setHoverTargetId(null)

      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev)
        
        // CASO 1: No hay target cercano (drop en vacío)
        if (!targetId) {
          // Limpiar z-index del elemento arrastrado
          setZIndexes((prevZ) => {
            const next = { ...prevZ }
            delete next[dragId]
            return next
          })
          return prev
        }

        // CASO 2: Hay target cercano (intento de combinación)
        const spawnPos = prev[dragId]
        if (!spawnPos) return prev

        playSoundBeforeCombining()

        // LOCK: Prevenir interacción durante la animación
        setIsCombining(true)

        // Delay de 700ms para animación antes de combinar
        setTimeout(() => {
          const combined = combineAndReplace(dragId, targetId, spawnPos)
          
          if (!combined) {
            // FALLO: Combinación no válida
            playFailSound()
            showNotification(
              'Too complex for demo! Go play in a board!',
              spawnPos,
            )

            // Limpiar z-indexes y desbloquear después de 2 segundos
            setTimeout(() => {
              setZIndexes((prevZ) => {
                const next = { ...prevZ }
                delete next[dragId]
                delete next[targetId]
                return next
              })
              setIsCombining(false) // UNLOCK
            }, 2000) // Esperar a que desaparezca la notificación
          } else {
            // ÉXITO: Combinación válida
            setZIndexes((prevZ) => {
              const next = { ...prevZ }
              delete next[dragId]
              delete next[targetId]
              return next
            })
            setIsCombining(false) // UNLOCK inmediato
          }
        }, 700) // Delay para animación de "drop"

        return prev
      })
    }

    // Registrar event listeners globales
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    // Cleanup al desmontar
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [instances, positions, hitRadius, isCombining])

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <>
      {/* Componente de notificación flotante */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        position={notification.position}
        onClose={hideNotification}
      />
      
      {/* Sistema de rutas (actualmente solo tiene home) */}
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