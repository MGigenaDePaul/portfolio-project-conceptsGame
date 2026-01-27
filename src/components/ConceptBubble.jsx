// ConceptBubble.jsx
import './ConceptBubble.css'

const ConceptBubble = ({
  concept,
  position,
  onPointerDown,
  isDropTarget,
  isDragging,
  zIndex,
}) => {
  return (
    <div
      className={`concept-bubble ${isDropTarget ? 'drop-target' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ left: position.x, top: position.y, zIndex: zIndex || 0 }}
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
