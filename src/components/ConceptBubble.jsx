import './ConceptBubble.css'

const ConceptBubble = ({ concept, position, onPointerDown }) => {
  return (
    <div
      className="concept-bubble"
      style={{
        left: position.x,
        top: position.y,
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
