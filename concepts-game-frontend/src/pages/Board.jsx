// src/pages/Board.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CONCEPTS } from '../game/concepts';
import { boardsApi } from '../api/boards';
import { useGameSounds } from '../hooks/useGameSounds';
import GameBoard from '../components/GameBoard';
import Notification from '../components/Notification';
import './Board.css';

const getHitRadius = () => {
  const width = window.innerWidth;
  if (width < 480) return 60;
  if (width < 768) return 75;
  return 100;
};

const Board = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  // Board data from API
  const [boardData, setBoardData] = useState(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Game state
  const [instances, setInstances] = useState({});
  const [positions, setPositions] = useState({});
  const [discoveredConcepts, setDiscoveredConcepts] = useState(new Set());
  const [hoverTargetId, setHoverTargetId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [zIndexes, setZIndexes] = useState({});
  const [hitRadius, setHitRadius] = useState(getHitRadius());
  const [isCombining, setIsCombining] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    position: { x: 0, y: 0 },
  });

  const [activePanel, setActivePanel] = useState('none');
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileOrTablet = viewportWidth < 1024;

  const togglePanel = useCallback((panel) => {
    setActivePanel((prev) => (prev === panel ? 'none' : panel));
  }, []);

  const combineAudioRef = useRef(null);
  const failAudioRef = useRef(null);
  const pressBubbleAudioRef = useRef(null);
  const soundBeforeCombiningAudioRef = useRef(null);
  const draggingRef = useRef({ id: null, offsetX: 0, offsetY: 0 });

  // AUDIO sounds
  const { playGrab, playBeforeCombine, playCombineSuccess, playCombineFail} = useGameSounds();

  const play = (ref) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const displayNotification = (message, position) => {
    setNotification({ isVisible: true, message, position });
  };

  const clearNotification = () => {
    setNotification({
      isVisible: false,
      message: '',
      position: { x: 0, y: 0 },
    });
  };

  // ─── Load board from API ─────────────────────────────
  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      setLoadingBoard(true);
      setLoadError(null);

      try {
        const data = await boardsApi.get(boardId);
        setBoardData(data);

        const discovered = new Set(
          data.discoveries.map((d) => d.concept_id),
        );
        setDiscoveredConcepts(discovered);

        const newInstances = {};
        const newPositions = {};

        data.instances.forEach((inst) => {
          newInstances[inst.id] = {
            instanceId: inst.id,
            conceptId: inst.concept_id,
            name: inst.name,
            emoji: inst.emoji,
            isNewlyCombined: false,
          };
          newPositions[inst.id] = {
            x: inst.position_x ?? 200 + Math.random() * 400,
            y: inst.position_y ?? 200 + Math.random() * 300,
          };
        });

        setInstances(newInstances);
        setPositions(newPositions);
      } catch (err) {
        console.error('Failed to load board:', err);
        setLoadError(err.message);
      } finally {
        setLoadingBoard(false);
      }
    };

    loadBoard();
  }, [boardId]);

  // ─── Resize hit radius ───────────────────────────────
  useEffect(() => {
    const handleResize = () => setHitRadius(getHitRadius());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Helper: get concept info ────────────────────────
  const getConceptInfo = useCallback((conceptId, instance) => {
    const local = CONCEPTS[conceptId];
    if (local) return local;

    if (instance) {
      return {
        id: conceptId,
        name: instance.name || conceptId,
        emoji: instance.emoji || '❓',
      };
    }

    return { id: conceptId, name: conceptId, emoji: '❓' };
  }, []);

  // ─── Hit detection ───────────────────────────────────
  const getHitTarget = useCallback(
    (dragId, currentPositions) => {
      const p = currentPositions[dragId];
      if (!p) return null;

      let best = null;
      let bestDist = Infinity;

      for (const otherId of Object.keys(instances)) {
        if (otherId === dragId) continue;
        const q = currentPositions[otherId];
        if (!q) continue;

        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < hitRadius && dist < bestDist) {
          bestDist = dist;
          best = otherId;
        }
      }

      return best;
    },
    [instances, hitRadius],
  );

  // ─── Combine via API ─────────────────────────────────
  const combineAndReplace = useCallback(
    async (aInstanceId, bInstanceId, spawnPos) => {
      const aInstance = instances[aInstanceId];
      const bInstance = instances[bInstanceId];
      if (!aInstance || !bInstance) return false;

      try {
        const result = await boardsApi.combine(boardId, {
          conceptAId: aInstance.conceptId,
          conceptBId: bInstance.conceptId,
          instanceAId: aInstanceId,
          instanceBId: bInstanceId,
        });

        if (!result.success) return false;

        playCombineSuccess();

        const newInstanceId = result.newInstance.id;
        const resultConcept = result.concept;

        if (result.isNewDiscovery) {
          setDiscoveredConcepts((prev) =>
            new Set([...prev, resultConcept.id]),
          );
        }

        if (result.complexityImproved) {
          displayNotification(
            `⬆️ ${resultConcept.name} complexity improved!`,
            spawnPos,
          );
          setTimeout(() => clearNotification(), 2500);
        }

        setInstances((prev) => {
          const next = { ...prev };
          delete next[aInstanceId];
          delete next[bInstanceId];
          next[newInstanceId] = {
            instanceId: newInstanceId,
            conceptId: resultConcept.id,
            name: resultConcept.name,
            emoji: resultConcept.emoji,
            isNewlyCombined: true,
          };
          return next;
        });

        setPositions((prev) => {
          const next = { ...prev };
          delete next[aInstanceId];
          delete next[bInstanceId];
          next[newInstanceId] = {
            x: result.newInstance.position_x ?? spawnPos.x,
            y: result.newInstance.position_y ?? spawnPos.y,
          };
          return next;
        });

        return true;
      } catch (err) {
        console.error('Combine API error:', err);
        return false;
      }
    },
    [instances, boardId],
  );

  // ─── Pointer down on bubble ──────────────────────────
  // Adapted signature for GameBoard: (instanceId, event)
  const handleElementPointerDown = useCallback(
    (instanceId, e) => {
      if (isCombining) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      playGrab();

      const p = positions[instanceId];
      if (!p) return;

      setDraggingId(instanceId);
      setZIndexes((prev) => ({ ...prev, [instanceId]: 9999 }));

      e.currentTarget.setPointerCapture?.(e.pointerId);

      draggingRef.current = {
        id: instanceId,
        offsetX: e.clientX - p.x,
        offsetY: e.clientY - p.y,
      };
    },
    [isCombining, positions],
  );

  // ─── Pointer move + up (drag & combine) ──────────────
  useEffect(() => {
    const onMove = (e) => {
      const d = draggingRef.current;
      if (!d.id) return;

      const x = e.clientX - d.offsetX;
      const y = e.clientY - d.offsetY;

      setPositions((prev) => {
        const next = { ...prev, [d.id]: { x, y } };
        const targetId = getHitTarget(d.id, next);
        setHoverTargetId(targetId);

        if (targetId) {
          setZIndexes((prevZ) => ({
            ...prevZ,
            [targetId]: 100,
            [d.id]: 9999,
          }));
        } else {
          setZIndexes((prevZ) => {
            const updated = { ...prevZ, [d.id]: 9999 };
            Object.keys(prevZ).forEach((key) => {
              if (key !== d.id && prevZ[key] === 100) {
                delete updated[key];
              }
            });
            return updated;
          });
        }

        return next;
      });
    };

    const onUp = () => {
      const d = draggingRef.current;
      if (!d.id) return;

      const dragId = d.id;
      draggingRef.current.id = null;

      setDraggingId(null);
      setHoverTargetId(null);

      setPositions((prev) => {
        const targetId = getHitTarget(dragId, prev);

        if (!targetId) {
          setZIndexes((prevZ) => {
            const next = { ...prevZ };
            delete next[dragId];
            return next;
          });
          return prev;
        }

        const dragPos = prev[dragId];
        const targetPos = prev[targetId];
        if (!dragPos || !targetPos) return prev;

        const bubbleWidth = 150;
        const bubbleHeight = 50;
        const dragCenterX = dragPos.x + bubbleWidth / 2;
        const dragCenterY = dragPos.y + bubbleHeight / 2;
        const targetCenterX = targetPos.x + bubbleWidth / 2;
        const targetCenterY = targetPos.y + bubbleHeight / 2;
        const midX = (dragCenterX + targetCenterX) / 2;
        const midY = (dragCenterY + targetCenterY) / 2;
        const notificationPosition = { x: midX, y: midY };

        playBeforeCombine();
        setIsCombining(true);

        setTimeout(async () => {
          const combined = await combineAndReplace(
            dragId,
            targetId,
            dragPos,
          );

          if (!combined) {
            playCombineFail();
            displayNotification('No recipe found!', notificationPosition);

            setTimeout(() => {
              clearNotification();
            }, 2000);
          }

          setZIndexes((prevZ) => {
            const next = { ...prevZ };
            delete next[dragId];
            delete next[targetId];
            return next;
          });
          setIsCombining(false);
        }, 700);

        return prev;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [instances, hitRadius, isCombining, getHitTarget, combineAndReplace]);

  // ─── Build elements array for GameBoard ──────────────
  const elements = useMemo(() => {
    return Object.values(instances).map((instance) => {
      const position = positions[instance.instanceId];
      const concept = getConceptInfo(instance.conceptId, instance);

      return {
        instanceId: instance.instanceId,
        conceptId: instance.conceptId,
        x: position?.x ?? 0,
        y: position?.y ?? 0,
        emoji: concept.emoji,
        name: concept.name,
        zIndex: zIndexes[instance.instanceId] || 5,
        isLocked: false,
        lockedBy: null,
      };
    }).filter((el) => positions[el.instanceId]);
  }, [instances, positions, zIndexes, getConceptInfo]);

  // ─── Spawn instance from knowledge panel via API ─────
  const addConceptToBoard = async (conceptId) => {
    const sidebarOffset = isMobileOrTablet ? 0 : 220;
    const knowledgeOffset = isMobileOrTablet ? 0 : 320;
    const centerX =
      (window.innerWidth - sidebarOffset - knowledgeOffset) / 2 +
      sidebarOffset;
    const centerY = window.innerHeight / 2;
    const posX = centerX + (Math.random() - 0.5) * 100;
    const posY = centerY + (Math.random() - 0.5) * 100;

    try {
      const result = await boardsApi.spawn(boardId, {
        conceptId,
        positionX: posX,
        positionY: posY,
      });

      const inst = result.instance;

      setInstances((prev) => ({
        ...prev,
        [inst.id]: {
          instanceId: inst.id,
          conceptId: inst.concept_id,
          name: inst.name,
          emoji: inst.emoji,
          isNewlyCombined: false,
        },
      }));

      setPositions((prev) => ({
        ...prev,
        [inst.id]: {
          x: inst.position_x,
          y: inst.position_y,
        },
      }));
    } catch (err) {
      console.error('Failed to spawn instance:', err);
      displayNotification(err.message || 'Failed to spawn concept', {
        x: posX,
        y: posY,
      });
      setTimeout(() => clearNotification(), 2000);
    }
  };

  // ─── Organize discoveries for knowledge panel ────────
  const organizeByCategory = () => {
    const categories = {
      UNCATEGORIZED: [],
    };

    discoveredConcepts.forEach((conceptId) => {
      const concept = CONCEPTS[conceptId];
      const discoveryData = boardData?.discoveries?.find(
        (d) => d.concept_id === conceptId,
      );

      const name = concept?.name || discoveryData?.name || conceptId;
      const emoji = concept?.emoji || discoveryData?.emoji || '❓';

      if (
        searchFilter &&
        !name.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        return;
      }

      const category = concept?.category || 'UNCATEGORIZED';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        name,
        emoji,
        conceptId,
      });
    });

    return categories;
  };

  const categories = organizeByCategory();

  // ─── Loading / error states ──────────────────────────
  if (loadingBoard) {
    return (
      <div className="board-container">
        <div className="board-main">
          <div className="board-loading">
            <p>Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="board-container">
        <div className="board-main">
          <div className="board-loading">
            <p>⚠️ {loadError}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="board-container">
      {/* Notification */}
      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        position={notification.position}
      />

      {/* Mobile/Tablet panel toggle bar */}
      {isMobileOrTablet && (
        <div className="board-mobile-toolbar">
          <button
            className={`mobile-panel-btn ${activePanel === 'collection' ? 'active' : ''}`}
            onClick={() => togglePanel('collection')}
          >
            📚 Collection
          </button>
          <Link to="/" className="mobile-home-btn">
            🏠
          </Link>
          <button
            className={`mobile-panel-btn ${activePanel === 'knowledge' ? 'active' : ''}`}
            onClick={() => togglePanel('knowledge')}
          >
            📖 Knowledge
          </button>
        </div>
      )}

      {/* Left Sidebar */}
      <div
        className={`board-sidebar ${isMobileOrTablet ? 'board-sidebar--overlay' : ''} ${activePanel === 'collection' ? 'board-sidebar--open' : ''}`}
      >
        <div className="sidebar-header">
          <span className="sidebar-icon">📚</span>
          <span className="sidebar-title">MY COLLECTION</span>
          {isMobileOrTablet && (
            <button
              className="panel-close-btn"
              onClick={() => setActivePanel('none')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="collection-item active">
          <span className="collection-emoji">🧪</span>
          <span className="collection-name">States of Matter</span>
          <span className="collection-indicator">🟢</span>
        </div>
      </div>

      {/* Main board area */}
      <div className="board-main">
        {/* Top toolbar — only show on desktop */}
        {!isMobileOrTablet && (
          <div className="board-toolbar">
            <button className="toolbar-btn" title="Undo">
              <span>↶</span>
            </button>
            <button className="toolbar-btn" title="Collections">
              <span>📊</span>
            </button>
            <button className="toolbar-btn" title="Home">
              <Link
                to="/"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <span>🏠</span>
              </Link>
            </button>
            <button className="toolbar-btn" title="Settings">
              <span>⚙️</span>
            </button>
          </div>
        )}

        {/* ── GameBoard replaces the old board-canvas div ── */}
        <GameBoard
          elements={elements}
          draggingId={draggingId}
          dropTargetId={hoverTargetId}
          onElementPointerDown={handleElementPointerDown}
          className="board-canvas"
        >
          {/* Board name + discovery count overlay */}
          <div className="board-warning">
            <p>{boardData?.name || 'Board'}</p>
            <p>{discoveredConcepts.size} discoveries</p>
          </div>
        </GameBoard>
      </div>

      {/* Right sidebar - Knowledge */}
      <div
        className={`knowledge-sidebar ${isMobileOrTablet ? 'knowledge-sidebar--overlay' : ''} ${activePanel === 'knowledge' ? 'knowledge-sidebar--open' : ''}`}
      >
        <div className="knowledge-header">
          <div className="knowledge-header-row">
            <h2 className="knowledge-title">Knowledge</h2>
            {isMobileOrTablet && (
              <button
                className="panel-close-btn"
                onClick={() => setActivePanel('none')}
              >
                ✕
              </button>
            )}
          </div>
          <p className="knowledge-count">
            {discoveredConcepts.size} concepts
          </p>
        </div>

        <div className="knowledge-search">
          <input
            type="text"
            placeholder="Search everything..."
            className="knowledge-search-input"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          <button
            className="knowledge-filter-btn"
            onClick={() => setSearchFilter('')}
            title="Clear filter"
          >
            {searchFilter ? '✕' : '☰'}
          </button>
        </div>

        <div className="knowledge-categories">
          {Object.entries(categories).map(
            ([categoryName, items]) =>
              items.length > 0 && (
                <div key={categoryName} className="knowledge-category">
                  <div className="category-header">
                    <span className="category-name">{categoryName}</span>
                    <span className="category-count">{items.length}</span>
                  </div>
                  <div className="category-items">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="category-item"
                        onClick={() => addConceptToBoard(item.conceptId)}
                        title="Click to add to board"
                      >
                        <span className="category-item-emoji">
                          {item.emoji}
                        </span>
                        <span className="category-item-name">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      {/* Overlay backdrop */}
      {isMobileOrTablet && activePanel !== 'none' && (
        <div
          className="board-overlay-backdrop"
          onClick={() => setActivePanel('none')}
        />
      )}
    </div>
  );
};

export default Board;