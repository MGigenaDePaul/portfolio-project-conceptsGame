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
}) => {
  const [hasSpawned, setHasSpawned] = useState(!isSpawning)

  useEffect(() => {
    if (isSpawning && spawnDelayMs >= 0) {
      // Esperar el delay antes de activar la animación
      const timer = setTimeout(() => {
        setHasSpawned(true)
      }, spawnDelayMs)

      return () => clearTimeout(timer)
    }
  }, [isSpawning, spawnDelayMs])

  return (
    <div
      className={`concept-bubble
        ${isDropTarget ? 'drop-target' : ''}
        ${isDragging ? 'dragging' : ''}
        ${!hasSpawned ? 'spawning' : 'spawned'}
        concept-${concept.id}
      `}
      style={{
        left: position.x,
        top: position.y,
        zIndex: zIndex || 0,
        animationDelay: hasSpawned ? '0ms' : `${spawnDelayMs}ms`,
      }}
      onPointerDown={onPointerDown}
      role="button"
      tabIndex={0}
    >
      <span className="concept-emoji">{concept.emoji}</span>
      <span className="concept-name">{concept.name}</span>
    </div>
  )
}

export default ConceptBubble