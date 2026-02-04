import { useState, useEffect } from 'react'
import './ConceptBubble.css'

const ConceptBubble = ({
  concept,
  position,
  zIndex,
  onPointerDown,
  isDropTarget,
  isDragging,
  spawnDelayMs = 0,
  isSpawning = false,
  isNewlyCombined = false,
}) => {
  const [hasSpawned, setHasSpawned] = useState(!isSpawning)

  useEffect(() => {
    if (isSpawning && spawnDelayMs >= 0) {
      const timer = setTimeout(() => {
        setHasSpawned(true)
      }, spawnDelayMs)
      return () => clearTimeout(timer)
    }
  }, [isSpawning, spawnDelayMs])

  useEffect(() => {
    if (isNewlyCombined) {
      setHasSpawned(true)
    }
  }, [isNewlyCombined])

  // 🔥 SOLUCIÓN NUCLEAR: z-index super alto cuando arrastra
  const calculatedZIndex = isDragging
    ? 999999
    : isDropTarget
      ? 100
      : zIndex || 0

  return (
    <div
      className={`concept-bubble
        ${isDropTarget ? 'drop-target' : ''}
        ${isDragging ? 'dragging' : ''}
        ${!hasSpawned ? 'spawning' : isNewlyCombined ? 'spawned-fast' : 'spawned'}
        concept-${concept.id}
      `}
      style={{
        left: position.x,
        top: position.y,
        zIndex: calculatedZIndex,
        // 🔥 AGREGAR TAMBIÉN POSITION PARA CREAR NUEVO STACKING CONTEXT
        position: 'absolute',
        animationDelay: hasSpawned ? '0ms' : `${spawnDelayMs}ms`,
      }}
      onPointerDown={onPointerDown}
      role='button'
      tabIndex={0}
    >
      <span className='concept-emoji'>{concept.emoji}</span>
      <span className='concept-name'>{concept.name}</span>
    </div>
  )
}

export default ConceptBubble
