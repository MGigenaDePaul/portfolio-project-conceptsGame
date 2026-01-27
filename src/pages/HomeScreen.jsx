import ConceptBubble from '../components/ConceptBubble'
import MyBoards from '../components/MyBoards'
import { CONCEPTS } from '../game/concepts'

const HomeScreen = ({
  discoveredIds,
  positions,
  onPointerDownBubble,
  hoverTargetId,
  draggingId,
  zIndexes,
}) => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          Concepts <span className="app-subtitle">Demo</span>
        </h1>
      </header>

      <div className="concepts-area">
        {discoveredIds.map((id) => {
          const concept = CONCEPTS[id]
          const position = positions[id] || { x: 0, y: 0 }

          return (
            <ConceptBubble
              key={id}
              concept={concept}
              position={position}
              onPointerDown={onPointerDownBubble(id)}
              isDropTarget={id === hoverTargetId}
              isDragging={id === draggingId}
              zIndex={zIndexes[id] || 0}  // 
            />
          )
        })}
      </div>

      <MyBoards />

      <footer className="app-footer">
        <p>
          CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT, DISCOVERED CONCEPTS WILL BE
          LOST
        </p>
      </footer>
    </div>
  )
}

export default HomeScreen