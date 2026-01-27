import ConceptBubble from '../components/ConceptBubble'
import MyBoards from '../components/MyBoards'
import { CONCEPTS } from '../game/concepts'

const HomeScreen = ({
  instances,
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

      <MyBoards />

      <div className="concepts-area">
        {Object.keys(instances).map((instanceId) => {
          const instance = instances[instanceId]
          const concept = CONCEPTS[instance.conceptId]
          const position = positions[instanceId] || { x: 0, y: 0 }

          return (
            <ConceptBubble
              key={instanceId}
              concept={concept}
              position={position}
              onPointerDown={onPointerDownBubble(instanceId)}
              isDropTarget={instanceId === hoverTargetId}
              isDragging={instanceId === draggingId}
              zIndex={zIndexes[instanceId] || 0}
            />
          )
        })}
      </div>

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