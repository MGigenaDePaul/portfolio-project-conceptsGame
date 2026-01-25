import './ConceptBubble.css'

const ConceptBubble = ({ concept, position, onClick, isSelected, isDragging }) => {
  return (
    <button
      className={`concept-bubble ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={onClick}
    >
      <span className="concept-emoji">{concept.emoji}</span>
      <span className="concept-name">{concept.name}</span>
    </button>
  )
}

export default ConceptBubble