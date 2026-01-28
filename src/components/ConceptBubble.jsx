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
  return (
    <div
      className={`concept-bubble
        ${isDropTarget ? 'drop-target' : ''}
        ${isDragging ? 'dragging' : ''}
        ${isSpawning ? 'spawning' : 'spawned'}
        concept-${concept.id}
      `}
      style={{
        left: position.x,
        top: position.y,
        zIndex: zIndex || 0,
        transitionDelay: `${spawnDelayMs}ms`,
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
