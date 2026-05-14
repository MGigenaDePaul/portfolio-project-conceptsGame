// src/components/GameBoard.jsx
//
// Reusable board canvas that renders elements and remote cursors.
// Knows NOTHING about APIs, sockets, rooms, or multiplayer.
// The parent owns all state and tells this component what to display.

import './GameBoard.css';
import './ConceptBubble.css';

const conceptHue = (conceptId = '') => {
  let h = 0;
  for (let i = 0; i < conceptId.length; i++) {
    h = (Math.imul(31, h) + conceptId.charCodeAt(i)) | 0;
  }
  return (h >>> 0) % 360;
};

const GameBoard = ({
  elements = [],
  draggingId = null,
  dropTargetId = null,
  cursors = [],
  boardRef,
  className = '',
  onElementPointerDown,
  onPointerMove,
  onPointerUp,
  children,
}) => {
  return (
    <div
      className={`game-board ${className}`}
      ref={boardRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {elements.map((el) => {
        const isDragging = draggingId === el.instanceId;
        const isDropTarget = dropTargetId === el.instanceId;

        const hue = conceptHue(el.conceptId);

        return (
          <div
            key={el.instanceId}
            className={[
              'board-concept',
              'concept-bubble',
              `concept-${el.conceptId}`,
              isDragging && 'dragging',
              isDropTarget && 'drop-target',
              el.isLocked && 'locked',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              zIndex: el.zIndex ?? 5,
              cursor: isDragging
                ? 'grabbing'
                : el.isLocked
                  ? 'not-allowed'
                  : 'grab',
              '--c-bg': `hsl(${hue},65%,11%)`,
              '--c-border': `hsl(${hue},85%,52%)`,
            }}
            onPointerDown={(e) => onElementPointerDown?.(el.instanceId, e)}
          >
            <span className="board-concept-emoji">{el.emoji}</span>
            <span className="board-concept-name">{el.name}</span>
          </div>
        );
      })}

      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="remote-cursor"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
          }}
        >
          <div
            className="remote-cursor-pointer"
            style={{ color: cursor.color || '#fff' }}
          />
          <span
            className="remote-cursor-label"
            style={{ backgroundColor: cursor.color || '#666' }}
          >
            {cursor.name}
          </span>
        </div>
      ))}

      {children}
    </div>
  );
};

export default GameBoard;