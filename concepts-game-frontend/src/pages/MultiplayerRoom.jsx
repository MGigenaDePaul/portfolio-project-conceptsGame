// src/pages/MultiplayerRoom.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSocket } from '../hooks/useSocket';
import { useMultiplayerBoard } from '../hooks/useMultiplayerBoard';
import GameBoard from '../components/GameBoard';
import './MultiplayerRoom.css';

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
  const [notifications, setNotifications] = useState([]);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [playersCollapsed, setPlayersCollapsed] = useState(false);
  const [combinedElements, setCombinedElements] = useState(new Set());

  // ─── Palette drag state ───
  const [paletteDrag, setPaletteDrag] = useState(null);
  const paletteDragRef = useRef(null);
  const [boardDragOver, setBoardDragOver] = useState(false);
  const [dropTargetId, setDropTargetId] = useState(null);

  // ─── Join room ───
  useEffect(() => {
    if (connected && user) {
      joinRoom(code, user.username);
    }
  }, [connected, code, user, joinRoom]);

  // ─── Notifications ───
  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev.slice(-4), { id, message, type, exiting: false }]);

    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, exiting: true } : n)
      );
    }, 2700);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // ─── Socket event listeners ───
  useEffect(() => {
    const handleCombined = ({ removedIds, newElement, combinedBy }) => {
      const player = players.find(p => p.socketId === combinedBy);
      const name = player?.username || 'Someone';
      showNotification(`✨ ${name} discovered ${newElement.emoji} ${newElement.name}!`, 'success');

      if (newElement?.instanceId) {
        setCombinedElements(prev => new Set([...prev, newElement.instanceId]));
        setTimeout(() => {
          setCombinedElements(prev => {
            const next = new Set(prev);
            next.delete(newElement.instanceId);
            return next;
          });
        }, 400);
      }
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

  // ─── Helpers ───
  const getLocalSocketId = () => socket.current?.id;
  const isHost = () => roomState?.hostId === user?.id;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlayerColor = useCallback((socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.color || '#888';
  }, [players]);

  const getPlayerName = useCallback((socketId) => {
    const player = players.find(p => p.socketId === socketId);
    return player?.username || 'Unknown';
  }, [players]);

  // ═══════════════════════════════════════
  //  PALETTE DRAG TO BOARD
  // ═══════════════════════════════════════

  const DRAG_THRESHOLD = 5;

  const handlePalettePointerDown = useCallback((e, concept) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    paletteDragRef.current = {
      concept,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      isDragging: false,
    };

    setPaletteDrag({
      concept,
      currentX: clientX,
      currentY: clientY,
      isDragging: false,
    });
  }, []);

  const handlePalettePointerMove = useCallback((e) => {
    if (!paletteDragRef.current) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    const ref = paletteDragRef.current;
    const dx = clientX - ref.startX;
    const dy = clientY - ref.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!ref.isDragging && dist > DRAG_THRESHOLD) {
      ref.isDragging = true;
    }

    ref.currentX = clientX;
    ref.currentY = clientY;

    setPaletteDrag({
      concept: ref.concept,
      currentX: clientX,
      currentY: clientY,
      isDragging: ref.isDragging,
    });

    if (ref.isDragging && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const isOver =
        clientX >= boardRect.left &&
        clientX <= boardRect.right &&
        clientY >= boardRect.top &&
        clientY <= boardRect.bottom;
      setBoardDragOver(isOver);
    }
  }, []);

  const handlePalettePointerUp = useCallback((e) => {
    if (!paletteDragRef.current) return;

    const ref = paletteDragRef.current;
    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? ref.currentX;
    const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? ref.currentY;

    if (ref.isDragging && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const isOver =
        clientX >= boardRect.left &&
        clientX <= boardRect.right &&
        clientY >= boardRect.top &&
        clientY <= boardRect.bottom;

      if (isOver) {
        const boardX = clientX - boardRect.left;
        const boardY = clientY - boardRect.top;
        const concept = ref.concept;

        addElement(concept.conceptId, concept.name, concept.emoji, boardX, boardY);
        showNotification(`Added ${concept.emoji} ${concept.name} to the board`, 'info');
      }
    }

    paletteDragRef.current = null;
    setPaletteDrag(null);
    setBoardDragOver(false);
  }, [addElement, showNotification]);

  // Global listeners for palette drag
  useEffect(() => {
    const onMove = (e) => handlePalettePointerMove(e);
    const onUp = (e) => handlePalettePointerUp(e);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [handlePalettePointerMove, handlePalettePointerUp]);

  // ═══════════════════════════════════════
  //  BOARD ELEMENT DRAG
  // ═══════════════════════════════════════

  // Signature matches GameBoard's onElementPointerDown(instanceId, event)
  const handleElementPointerDown = useCallback((instanceId, e) => {
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

    // ─── Find drop target ───
    const draggedEl = elements.get(instanceId);
    if (!draggedEl) return;

    let closestId = null;
    let closestDist = Infinity;

    for (const [otherId, otherEl] of elements) {
      if (otherId === instanceId) continue;
      const dx = x - otherEl.x;
      const dy = y - otherEl.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < COMBINE_DISTANCE && dist < closestDist) {
        closestDist = dist;
        closestId = otherId;
      }
    }

    setDropTargetId(closestId);
  }, [moveElement, moveCursor, elements]);

  const handlePointerUp = useCallback(() => {
    if (!draggingRef.current) return;

    const { instanceId } = draggingRef.current;
    const draggedEl = elements.get(instanceId);

    if (!draggedEl) {
      draggingRef.current = null;
      setDropTargetId(null);
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
    setDropTargetId(null);
  }, [elements, combineElements, releaseElement]);

  // ─── Current dragging ID for GameBoard prop ───
  const draggingId = draggingRef.current?.instanceId || null;

  // ═══════════════════════════════════════
  //  BUILD ELEMENTS ARRAY FOR GAMEBOARD
  // ═══════════════════════════════════════

  const localSocketId = getLocalSocketId();

  const gameBoardElements = useMemo(() => {
    return Array.from(elements.values()).map((el) => {
      const isLockedByMe = el.lockedBy === localSocketId;
      const isLockedByOther = el.lockedBy && el.lockedBy !== localSocketId;
      const lockerColor = el.lockedBy ? getPlayerColor(el.lockedBy) : null;
      const isCombined = combinedElements.has(el.instanceId);
      const conceptSlug = el.name?.toLowerCase().replace(/\s+/g, '');

      // Build extra CSS classes for multiplayer-specific states
      const extraClasses = [
        isLockedByMe && 'is-dragging',
        isLockedByOther && 'is-locked-other',
        lockerColor && 'has-locker',
        isCombined && 'is-combined',
        dropTargetId === el.instanceId && 'is-drop-target',
      ].filter(Boolean).join(' ');

      return {
        instanceId: el.instanceId,
        conceptId: conceptSlug || el.instanceId,
        x: el.x,
        y: el.y,
        emoji: el.emoji,
        name: el.name,
        zIndex: isLockedByMe ? 999999 : (dropTargetId === el.instanceId) ? 999 : el.lockedBy ? 998 : 1,
        isLocked: isLockedByOther,
        lockedBy: el.lockedBy,
        extraClassName: extraClasses,
        extraStyle: { '--locker-color': lockerColor || 'transparent' },
        overlay: isLockedByOther ? (
          <div
            className="mp-lock-indicator"
            style={{ background: lockerColor }}
            title={`Dragged by ${getPlayerName(el.lockedBy)}`}
          >
            🔒
          </div>
        ) : null,
      };
    });
  }, [elements, localSocketId, combinedElements, dropTargetId, getPlayerColor, getPlayerName]);

  // ═══════════════════════════════════════
  //  BUILD CURSORS ARRAY FOR GAMEBOARD
  // ═══════════════════════════════════════

  const gameBoardCursors = useMemo(() => {
    return Array.from(cursors.entries())
      .filter(([socketId]) => socketId !== localSocketId)
      .map(([socketId, pos]) => ({
        userId: socketId,
        x: pos.x,
        y: pos.y,
        color: getPlayerColor(socketId),
        name: pos.username || getPlayerName(socketId),
      }));
  }, [cursors, localSocketId, getPlayerColor, getPlayerName]);

  // ─── Filtered concepts for palette ───
  const filteredConcepts = availableConcepts.filter(c =>
    c.name.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  // ═══════════════════════════════════════
  //  WAITING ROOM
  // ═══════════════════════════════════════

  if (status === 'waiting') {
    const maxPlayers = roomState?.maxPlayers || 4;
    const emptySlots = Math.max(0, maxPlayers - players.length);

    return (
      <div className="mp-waiting">
        <div className="mp-waiting-content">
          <h1 className="mp-waiting-title">
            <span className="mp-waiting-title-emoji">🎮</span>
            Room: {code}
          </h1>

          <div className="mp-code-box">
            <span className="mp-code-label">Share this code with friends</span>
            <div className="mp-code-display">
              <span className="mp-code-text">{code}</span>
              <button
                onClick={copyCode}
                className={`mp-copy-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="mp-players-card">
            <div className="mp-players-card-header">
              <span className="mp-players-card-title">Players</span>
              <span className="mp-players-card-count">
                {players.length} / {maxPlayers}
              </span>
            </div>

            <div className="mp-players-list">
              {players.map((p, i) => (
                <div
                  key={p.socketId}
                  className="mp-player-item"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div
                    className={`mp-player-dot ${p.socketId === getLocalSocketId() ? 'is-self' : ''}`}
                    style={{ background: p.color, color: p.color }}
                  />
                  <span className="mp-player-name">
                    {p.username}
                    {p.userId === roomState?.hostId && (
                      <span className="mp-badge mp-badge-host">HOST</span>
                    )}
                    {p.socketId === getLocalSocketId() && (
                      <span className="mp-badge mp-badge-you">YOU</span>
                    )}
                  </span>
                </div>
              ))}

              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`empty-${i}`} className="mp-player-slot-empty">
                  <div className="mp-player-slot-empty-dot" />
                  <span className="mp-player-slot-empty-text">Waiting for player...</span>
                </div>
              ))}
            </div>
          </div>

          {isHost() ? (
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className="mp-start-btn"
            >
              🚀 Start Game {players.length < 2 ? '(need 2+ players)' : ''}
            </button>
          ) : (
            <div className="mp-waiting-msg">
              ⏳ Waiting for host to start
              <span className="mp-waiting-dots">
                <span /><span /><span />
              </span>
            </div>
          )}

          {!connected && (
            <div className="mp-connecting-msg">
              🔌 Connecting to server...
            </div>
          )}

          <button onClick={() => navigate('/multiplayer')} className="mp-leave-btn">
            ← Leave Room
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  GAME BOARD
  // ═══════════════════════════════════════

  const elementsArray = Array.from(elements.values());

  return (
    <div className="mp-game">
      {/* ─── Top bar ─── */}
      <div className="mp-topbar">
        <div className="mp-topbar-left">
          <button onClick={() => navigate('/multiplayer')} className="mp-topbar-leave">
            ← Leave
          </button>
          <span className="mp-topbar-code">Room: {code}</span>
        </div>

        <div className="mp-topbar-center">
          <span className="mp-topbar-discoveries">
            ✨ {availableConcepts.length} discoveries
          </span>
        </div>

        <div className="mp-topbar-right">
          {players.map((p) => (
            <div
              key={p.socketId}
              className={`mp-topbar-player ${p.socketId === localSocketId ? 'is-self' : ''}`}
              style={{ background: p.color }}
            >
              <span className="mp-topbar-player-tooltip">{p.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Stacking notifications ─── */}
      <div className="mp-notifications">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`mp-notification mp-notification-${n.type} ${n.exiting ? 'exiting' : ''}`}
          >
            {n.message}
            <div className="mp-notification-progress" />
          </div>
        ))}
      </div>

      {/* ─── GameBoard replaces the old mp-board div ─── */}
      <GameBoard
        elements={gameBoardElements}
        draggingId={draggingId}
        dropTargetId={dropTargetId}
        cursors={gameBoardCursors}
        boardRef={boardRef}
        className={`mp-board ${boardDragOver ? 'drag-over' : ''}`}
        onElementPointerDown={handleElementPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* ─── Sidebar ─── */}
      <div className="mp-sidebar">
        {/* Players section */}
        <div className="mp-sidebar-section">
          <div
            className="mp-sidebar-section-header"
            onClick={() => setPlayersCollapsed(!playersCollapsed)}
          >
            <span className="mp-sidebar-section-title">Players</span>
            <span className={`mp-sidebar-section-toggle ${playersCollapsed ? 'collapsed' : ''}`}>
              ▼
            </span>
          </div>
          <div className={`mp-sidebar-section-content ${playersCollapsed ? 'collapsed' : ''}`}>
            <div className="mp-sidebar-players">
              {players.map((p) => (
                <div key={p.socketId} className="mp-sidebar-player">
                  <div
                    className="mp-sidebar-player-dot"
                    style={{ background: p.color, color: p.color }}
                  />
                  <span className="mp-sidebar-player-name">
                    {p.username}
                    {p.socketId === localSocketId && (
                      <span className="mp-sidebar-player-you"> (you)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mp-sidebar-divider" />

        {/* Palette section */}
        <div className="mp-palette-section">
          <div className="mp-palette-header">
            <span className="mp-palette-title">Elements</span>
            <span className="mp-palette-count">{availableConcepts.length}</span>
          </div>
          <span className="mp-palette-hint">Drag onto the board to add</span>

          <input
            type="text"
            placeholder="Search elements..."
            value={paletteSearch}
            onChange={(e) => setPaletteSearch(e.target.value)}
            className="mp-palette-search"
          />

          <div className="mp-palette-list">
            {filteredConcepts.map((concept) => {
              const isBeingDragged =
                paletteDrag?.isDragging &&
                paletteDrag?.concept?.conceptId === concept.conceptId;

              return (
                <div
                  key={concept.conceptId}
                  className={`mp-palette-item ${isBeingDragged ? 'is-being-dragged' : ''}`}
                  onPointerDown={(e) => handlePalettePointerDown(e, concept)}
                  onTouchStart={(e) => handlePalettePointerDown(e, concept)}
                  title={`Drag ${concept.name} to the board`}
                  style={{ touchAction: 'none' }}
                >
                  <span className="mp-palette-item-emoji">{concept.emoji}</span>
                  <span className="mp-palette-item-name">{concept.name}</span>
                </div>
              );
            })}

            {filteredConcepts.length === 0 && (
              <p className="mp-palette-empty">
                {paletteSearch ? 'No matches found' : 'No elements discovered yet'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mp-sidebar-footer">
          <span className="mp-sidebar-footer-label">On Board</span>
          <span className="mp-sidebar-footer-count">{elementsArray.length}</span>
        </div>
      </div>

      {/* ─── Palette drag ghost (follows cursor) ─── */}
      {paletteDrag?.isDragging && (
        <div
          className="mp-palette-drag-ghost"
          style={{
            left: paletteDrag.currentX,
            top: paletteDrag.currentY,
          }}
        >
          <span className="mp-element-emoji">{paletteDrag.concept.emoji}</span>
          <span className="mp-element-name">{paletteDrag.concept.name}</span>
        </div>
      )}
    </div>
  );
}