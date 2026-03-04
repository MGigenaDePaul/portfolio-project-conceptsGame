import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSocket } from '../hooks/useSocket';
import { useMultiplayerBoard } from '../hooks/useMultiplayerBoard';

const COMBINE_DISTANCE = 80;

export default function MultiplayerRoom() {
  const { code } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const { socket, connected, emit, on, off } = useSocket();

  const {
    roomState, elements, players, cursors, status,
    availableConcepts,
    joinRoom, startGame,
    grabElement, moveElement, releaseElement, combineElements,
    addElement, moveCursor,
  } = useMultiplayerBoard(socket, emit, on, off);

  const boardRef = useRef(null);
  const draggingRef = useRef(null);
  const lastCursorEmit = useRef(0);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paletteSearch, setPaletteSearch] = useState('');

  // ─── Join room when socket connects ─────────────────
  useEffect(() => {
    if (connected && user) {
      joinRoom(code, user.username);
    }
  }, [connected, code, user, joinRoom]);

  // ─── Notification helper ────────────────────────────
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ─── Listen for combine results for notifications ───
  useEffect(() => {
    const handleCombined = ({ removedIds, newElement, combinedBy }) => {
      const player = players.find(p => p.socketId === combinedBy);
      const name = player?.username || 'Someone';
      showNotification(`✨ ${name} discovered ${newElement.emoji} ${newElement.name}!`, 'success');
    };

    const handleFailed = () => {
      showNotification('❌ No recipe for that combination', 'error');
    };

    const handlePlayerJoined = ({ username }) => {
      showNotification(`👤 ${username} joined the room`, 'info');
    };

    const handlePlayerLeft = ({ username }) => {
      showNotification(`👋 ${username} left the room`, 'info');
    };

    const unsub1 = on('element:combined', handleCombined);
    const unsub2 = on('element:combine-failed', handleFailed);
    const unsub3 = on('room:player-joined', handlePlayerJoined);
    const unsub4 = on('room:player-left', handlePlayerLeft);

    return () => {
      if (typeof unsub1 === 'function') unsub1();
      if (typeof unsub2 === 'function') unsub2();
      if (typeof unsub3 === 'function') unsub3();
      if (typeof unsub4 === 'function') unsub4();
    };
  }, [on, players, showNotification]);

  // ─── Helpers ────────────────────────────────────────
  const getLocalSocketId = () => socket.current?.id;

  const isHost = () => {
    return roomState?.hostId === user?.id;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Add element from palette ───────────────────────
  const handleAddFromPalette = useCallback((concept) => {
    // Place near center of the board with some randomness
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const centerX = (rect.width / 2) - 40 + (Math.random() * 100 - 50);
    const centerY = (rect.height / 2) - 40 + (Math.random() * 100 - 50);

    addElement(concept.conceptId, concept.name, concept.emoji, centerX, centerY);
    showNotification(`Added ${concept.emoji} ${concept.name} to the board`, 'info');
  }, [addElement, showNotification]);

  // ─── Pointer handlers ──────────────────────────────
  const handlePointerDown = useCallback((e, instanceId) => {
    e.preventDefault();
    e.stopPropagation();

    const el = elements.get(instanceId);
    if (!el) return;

    if (el.lockedBy && el.lockedBy !== getLocalSocketId()) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    draggingRef.current = {
      instanceId,
      offsetX: clientX - boardRect.left - el.x,
      offsetY: clientY - boardRect.top - el.y,
    };

    grabElement(instanceId);
  }, [elements, grabElement]);

  const handlePointerMove = useCallback((e) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    const boardX = clientX - boardRect.left;
    const boardY = clientY - boardRect.top;

    const now = Date.now();
    if (now - lastCursorEmit.current > 50) {
      moveCursor(boardX, boardY);
      lastCursorEmit.current = now;
    }

    if (!draggingRef.current) return;
    e.preventDefault();

    const { instanceId, offsetX, offsetY } = draggingRef.current;
    const x = clientX - boardRect.left - offsetX;
    const y = clientY - boardRect.top - offsetY;

    moveElement(instanceId, x, y);
  }, [moveElement, moveCursor]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;

    const { instanceId } = draggingRef.current;
    const draggedEl = elements.get(instanceId);

    if (!draggedEl) {
      draggingRef.current = null;
      return;
    }

    let combinedWith = null;
    let closestDist = Infinity;

    for (const [otherId, otherEl] of elements) {
      if (otherId === instanceId) continue;
      const dx = draggedEl.x - otherEl.x;
      const dy = draggedEl.y - otherEl.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < COMBINE_DISTANCE && dist < closestDist) {
        closestDist = dist;
        combinedWith = otherId;
      }
    }

    if (combinedWith) {
      combineElements(instanceId, combinedWith);
    } else {
      releaseElement(instanceId, draggedEl.x, draggedEl.y);
    }

    draggingRef.current = null;
  }, [elements, combineElements, releaseElement]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    board.addEventListener('pointermove', handlePointerMove);
    board.addEventListener('pointerup', handlePointerUp);
    board.addEventListener('pointerleave', handlePointerUp);
    board.addEventListener('touchmove', handlePointerMove, { passive: false });
    board.addEventListener('touchend', handlePointerUp);

    return () => {
      board.removeEventListener('pointermove', handlePointerMove);
      board.removeEventListener('pointerup', handlePointerUp);
      board.removeEventListener('pointerleave', handlePointerUp);
      board.removeEventListener('touchmove', handlePointerMove);
      board.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const getPlayerColor = (socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.color || '#888';
  };

  const getPlayerName = (socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.username || 'Unknown';
  };

  // ─── Filter palette concepts ────────────────────────
  const filteredConcepts = availableConcepts.filter(c =>
    c.name.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  // ─── Render: Waiting Screen ─────────────────────────
  if (status === 'waiting') {
    return (
      <div style={styles.waitingContainer}>
        <h1 style={styles.title}>🎮 Room: {code}</h1>

        <div style={styles.codeBox}>
          <span style={styles.codeLabel}>Share this code with friends:</span>
          <div style={styles.codeDisplay}>
            <span style={styles.codeText}>{code}</span>
            <button onClick={copyCode} style={styles.copyBtn}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        <div style={styles.playersCard}>
          <h2 style={styles.sectionTitle}>
            Players ({players.length}/{roomState?.maxPlayers || 4})
          </h2>
          <div style={styles.playersList}>
            {players.map((p) => (
              <div key={p.socketId} style={styles.playerItem}>
                <div style={{ ...styles.playerDot, background: p.color }} />
                <span style={styles.playerName}>
                  {p.username}
                  {p.userId === roomState?.hostId && (
                    <span style={styles.hostBadge}>HOST</span>
                  )}
                  {p.socketId === getLocalSocketId() && (
                    <span style={styles.youBadge}>YOU</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost() ? (
          <button
            onClick={startGame}
            disabled={players.length < 2}
            style={{
              ...styles.startBtn,
              opacity: players.length < 2 ? 0.5 : 1,
              cursor: players.length < 2 ? 'not-allowed' : 'pointer',
            }}
          >
            🚀 Start Game {players.length < 2 ? '(need 2+ players)' : ''}
          </button>
        ) : (
          <div style={styles.waitingMsg}>
            ⏳ Waiting for host to start the game...
          </div>
        )}

        {!connected && (
          <div style={styles.connectingMsg}>🔌 Connecting to server...</div>
        )}

        <button onClick={() => navigate('/multiplayer')} style={styles.leaveBtn}>
          ← Leave Room
        </button>
      </div>
    );
  }

  // ─── Render: Game Board ─────────────────────────────
  const elementsArray = Array.from(elements.values());
  const cursorsArray = Array.from(cursors.entries());

  return (
    <div style={styles.gameContainer}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button onClick={() => navigate('/multiplayer')} style={styles.topLeaveBtn}>
            ← Leave
          </button>
          <span style={styles.roomCode}>Room: {code}</span>
        </div>
        <div style={styles.topBarCenter}>
          <span style={styles.discoveryCount}>
            ✨ {availableConcepts.length} discoveries
          </span>
        </div>
        <div style={styles.topBarRight}>
          {players.map((p) => (
            <div
              key={p.socketId}
              style={{
                ...styles.topPlayerDot,
                background: p.color,
                border: p.socketId === getLocalSocketId()
                  ? '2px solid #fff'
                  : '2px solid transparent',
              }}
              title={p.username}
            />
          ))}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          style={{
            ...styles.notification,
            background:
              notification.type === 'success' ? '#2d7a3a' :
                notification.type === 'error' ? '#7a2d2d' : '#2d4a7a',
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Board */}
      <div
        ref={boardRef}
        style={styles.board}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Render elements */}
        {elementsArray.map((el) => {
          const isLockedByMe = el.lockedBy === getLocalSocketId();
          const isLockedByOther = el.lockedBy && el.lockedBy !== getLocalSocketId();
          const lockerColor = el.lockedBy ? getPlayerColor(el.lockedBy) : null;

          return (
            <div
              key={el.instanceId}
              onPointerDown={(e) => handlePointerDown(e, el.instanceId)}
              onTouchStart={(e) => handlePointerDown(e, el.instanceId)}
              style={{
                ...styles.element,
                left: el.x,
                top: el.y,
                cursor: isLockedByOther ? 'not-allowed' : 'grab',
                opacity: isLockedByOther ? 0.7 : 1,
                transform: isLockedByMe ? 'scale(1.1)' : 'scale(1)',
                boxShadow: lockerColor
                  ? `0 0 16px ${lockerColor}88, 0 4px 12px rgba(0,0,0,0.4)`
                  : '0 4px 12px rgba(0,0,0,0.4)',
                borderColor: lockerColor || '#444',
                zIndex: isLockedByMe ? 1000 : el.lockedBy ? 999 : 1,
                transition: isLockedByMe ? 'none' : 'transform 0.1s ease',
                touchAction: 'none',
                userSelect: 'none',
              }}
            >
              <span style={styles.elementEmoji}>{el.emoji}</span>
              <span style={styles.elementName}>{el.name}</span>
              {isLockedByOther && (
                <div
                  style={{ ...styles.lockedIndicator, background: lockerColor }}
                  title={`Dragged by ${getPlayerName(el.lockedBy)}`}
                >
                  🔒
                </div>
              )}
            </div>
          );
        })}

        {/* Render other players' cursors */}
        {cursorsArray.map(([socketId, pos]) => {
          if (socketId === getLocalSocketId()) return null;
          const color = getPlayerColor(socketId);
          const name = pos.username || getPlayerName(socketId);

          return (
            <div
              key={`cursor-${socketId}`}
              style={{ ...styles.remoteCursor, left: pos.x, top: pos.y }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={color}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
              >
                <path d="M5.65 5.65l12.7 5.08-5.08 2.54-2.54 5.08z" />
              </svg>
              <span style={{ ...styles.cursorLabel, background: color }}>
                {name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sidebar — Players + Element Palette */}
      <div style={styles.sidebar}>
        {/* Players section */}
        <h3 style={styles.sidebarTitle}>Players</h3>
        {players.map((p) => (
          <div key={p.socketId} style={styles.sidebarPlayer}>
            <div style={{ ...styles.sidebarDot, background: p.color }} />
            <span style={styles.sidebarName}>
              {p.username}
              {p.socketId === getLocalSocketId() ? ' (you)' : ''}
            </span>
          </div>
        ))}

        <div style={styles.sidebarDivider} />

        {/* Element Palette */}
        <h3 style={styles.sidebarTitle}>
          Elements ({availableConcepts.length})
        </h3>
        <p style={styles.paletteHint}>Click to add to board</p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={paletteSearch}
          onChange={(e) => setPaletteSearch(e.target.value)}
          style={styles.paletteSearch}
        />

        {/* Scrollable element list */}
        <div style={styles.paletteList}>
          {filteredConcepts.map((concept) => (
            <button
              key={concept.conceptId}
              onClick={() => handleAddFromPalette(concept)}
              style={styles.paletteItem}
              title={`Add ${concept.name} to board`}
            >
              <span style={styles.paletteEmoji}>{concept.emoji}</span>
              <span style={styles.paletteName}>{concept.name}</span>
            </button>
          ))}

          {filteredConcepts.length === 0 && (
            <p style={styles.paletteEmpty}>
              {paletteSearch ? 'No matches' : 'No elements yet'}
            </p>
          )}
        </div>

        <div style={styles.sidebarDivider} />

        <h3 style={styles.sidebarTitle}>On Board</h3>
        <span style={styles.sidebarCount}>{elementsArray.length}</span>
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────
const styles = {
  // === Waiting Screen ===
  waitingContainer: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#fff',
  },
  title: { fontSize: '2rem', marginBottom: '1.5rem' },
  codeBox: { marginBottom: '2rem', textAlign: 'center' },
  codeLabel: { color: '#888', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' },
  codeDisplay: { display: 'flex', alignItems: 'center', gap: '1rem' },
  codeText: {
    fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '8px',
    color: '#4ECDC4', fontFamily: 'monospace',
  },
  copyBtn: {
    background: '#1a1a2e', border: '1px solid #444', color: '#fff',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
  },
  playersCard: {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: '16px',
    padding: '1.5rem', width: '100%', maxWidth: '400px', marginBottom: '1.5rem',
  },
  sectionTitle: { fontSize: '1.1rem', marginBottom: '1rem', color: '#ccc' },
  playersList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  playerItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  playerDot: { width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0 },
  playerName: { fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  hostBadge: {
    background: '#FFD700', color: '#000', fontSize: '0.65rem',
    padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
  },
  youBadge: {
    background: '#4ECDC4', color: '#000', fontSize: '0.65rem',
    padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
  },
  startBtn: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
    border: 'none', padding: '14px 40px', borderRadius: '12px',
    fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem',
  },
  waitingMsg: { color: '#888', fontSize: '1rem', marginBottom: '1rem' },
  connectingMsg: { color: '#FFD700', fontSize: '0.9rem', marginBottom: '1rem' },
  leaveBtn: {
    marginTop: '1rem', background: 'transparent', color: '#888',
    border: '1px solid #333', padding: '10px 24px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.9rem',
  },

  // === Game Screen ===
  gameContainer: {
    width: '100vw', height: '100vh', background: '#0a0a0f',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 1.5rem', background: '#12121f',
    borderBottom: '1px solid #333', zIndex: 100,
  },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  topLeaveBtn: {
    background: 'transparent', border: '1px solid #444', color: '#aaa',
    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  roomCode: { color: '#4ECDC4', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold' },
  topBarCenter: { display: 'flex', alignItems: 'center' },
  discoveryCount: { color: '#FFD700', fontSize: '1rem', fontWeight: 'bold' },
  topBarRight: { display: 'flex', gap: '6px' },
  topPlayerDot: { width: '24px', height: '24px', borderRadius: '50%' },

  // === Notification ===
  notification: {
    position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)',
    padding: '10px 24px', borderRadius: '10px', color: '#fff', fontSize: '0.95rem',
    zIndex: 200, pointerEvents: 'none', whiteSpace: 'nowrap',
  },

  // === Board ===
  board: {
    flex: 1, position: 'relative', overflow: 'hidden', cursor: 'default',
    background: `
      radial-gradient(circle at 20% 20%, #1a1a2e 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, #16213e 0%, transparent 50%),
      #0a0a0f
    `,
  },

  // === Element Bubble ===
  element: {
    position: 'absolute', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '10px 16px',
    background: '#1a1a2e', border: '2px solid #444', borderRadius: '16px',
    minWidth: '70px', userSelect: 'none', WebkitUserSelect: 'none',
  },
  elementEmoji: { fontSize: '1.6rem', lineHeight: 1 },
  elementName: { fontSize: '0.75rem', color: '#ccc', marginTop: '4px', whiteSpace: 'nowrap' },
  lockedIndicator: {
    position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '10px',
  },

  // === Remote Cursor ===
  remoteCursor: {
    position: 'absolute', pointerEvents: 'none', zIndex: 2000,
    transition: 'left 0.05s linear, top 0.05s linear',
  },
  cursorLabel: {
    position: 'absolute', top: '18px', left: '12px', fontSize: '0.65rem',
    color: '#fff', padding: '1px 6px', borderRadius: '4px',
    whiteSpace: 'nowrap', fontWeight: 'bold',
  },

  // === Sidebar ===
  sidebar: {
    position: 'absolute', right: 0, top: '56px', bottom: 0, width: '220px',
    background: '#12121fee', borderLeft: '1px solid #333', padding: '1rem',
    zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'hidden',
  },
  sidebarTitle: {
    fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem',
    textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0,
  },
  sidebarPlayer: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexShrink: 0,
  },
  sidebarDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  sidebarName: { color: '#ccc', fontSize: '0.85rem' },
  sidebarDivider: { height: '1px', background: '#333', margin: '0.75rem 0', flexShrink: 0 },
  sidebarCount: { color: '#4ECDC4', fontSize: '1.5rem', fontWeight: 'bold' },

  // === Element Palette ===
  paletteHint: {
    color: '#555', fontSize: '0.7rem', marginBottom: '0.5rem', marginTop: '-0.25rem', flexShrink: 0,
  },
  paletteSearch: {
    width: '100%', padding: '6px 10px', borderRadius: '8px',
    border: '1px solid #444', background: '#0a0a0f', color: '#fff',
    fontSize: '0.8rem', marginBottom: '0.5rem', outline: 'none',
    flexShrink: 0, boxSizing: 'border-box',
  },
  paletteList: {
    flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
    gap: '4px', paddingRight: '4px',
  },
  paletteItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
    background: '#1a1a2e', border: '1px solid #333', borderRadius: '10px',
    cursor: 'pointer', color: '#fff', fontSize: '0.85rem', textAlign: 'left',
    transition: 'all 0.15s ease', width: '100%', flexShrink: 0,
  },
  paletteEmoji: { fontSize: '1.1rem', flexShrink: 0 },
  paletteName: { fontSize: '0.8rem', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  paletteEmpty: { color: '#555', fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' },
};