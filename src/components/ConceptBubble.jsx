import './ConceptBubble.css'

const ConceptBubble = ({
  concept,
  position,
  zIndex,
  onPointerDown,
  isDropTarget,
  isDragging,
}) => {
  return (
    <div
      className={`concept-bubble ${isDropTarget ? 'drop-target' : ''} ${isDragging ? 'dragging' : ''} concept-${concept.id}`}
      style={{ 
        left: position.x, 
        top: position.y,
        zIndex: zIndex || 0
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