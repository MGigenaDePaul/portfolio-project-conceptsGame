// src/pages/HomeScreen.jsx
import ConceptBubble from '../components/ConceptBubble';
import MyBoards from '../components/MyBoards';
import { CONCEPTS } from '../game/concepts';
import { useUser } from '../context/UserContext';

const HomeScreen = ({
  instances,
  positions,
  onPointerDownBubble,
  hoverTargetId,
  draggingId,
  zIndexes,
}) => {
  const { user, loading: userLoading } = useUser();

  return (
    <div className='app-container'>
      <header className='app-header'>
        <h1 className='app-title'>
          Concepts <span className='app-subtitle'>Demo</span>
        </h1>
      </header>

      {/* Show user name if logged in */}
      {user && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            zIndex: 30,
            fontSize: '13px',
            color: 'rgba(200, 209, 219, 0.7)',
            pointerEvents: 'none',
          }}
        >
          👤 {user.username}
        </div>
      )}

      <MyBoards />

      <div className='concepts-area'>
        {Object.keys(instances).map((instanceId, index) => {
          const instance = instances[instanceId];
          const concept = CONCEPTS[instance.conceptId];
          const position = positions[instanceId] || { x: 0, y: 0 };

          return (
            <ConceptBubble
              key={instanceId}
              concept={concept}
              position={position}
              onPointerDown={onPointerDownBubble(instanceId)}
              isDropTarget={instanceId === hoverTargetId}
              isDragging={instanceId === draggingId}
              zIndex={zIndexes[instanceId] || 0}
              spawnDelayMs={index * 150}
              isSpawning={!instance.isNewlyCombined}
              isNewlyCombined={instance.isNewlyCombined}
            />
          );
        })}
      </div>

      <footer className='app-footer'>
        <p>
          CONCEPTS IS STILL UNDER HEAVY DEVELOPMENT, DISCOVERED CONCEPTS WILL
          BE LOST
        </p>
      </footer>
    </div>
  );
};

export default HomeScreen;