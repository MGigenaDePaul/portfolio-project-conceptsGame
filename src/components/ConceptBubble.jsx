// ConceptBubble.jsx
import './ConceptBubble.css'

const ConceptBubble = ({ concept, position, onClick, isSelected, onPointerDown }) => {
  return (
    <div
      className={`concept-bubble ${isSelected ? 'selected' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <span className="concept-emoji">{concept.emoji}</span>
      <span className="concept-name">{concept.name}</span>
    </div>
  )
}

export default ConceptBubble
