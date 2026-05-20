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

// Bubble dimensions used for overlap detection (conservative estimates, bubbles are centered on x/y)
const BUBBLE_W = 180;
const BUBBLE_H = 56;

const resolveOverlaps = (positions) => {
  const MIN_DX = BUBBLE_W + 20;
  const MIN_DY = BUBBLE_H + 16;

  const ids = Object.keys(positions);
  if (ids.length <= 1) return positions;

  const result = {};
  for (const id of ids) result[id] = { ...positions[id] };

  for (let iter = 0; iter < 300; iter++) {
    let moved = false;

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = result[ids[i]];
        const b = result[ids[j]];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const overlapX = MIN_DX - Math.abs(dx);
        const overlapY = MIN_DY - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          if (overlapX <= overlapY) {
            const shift = overlapX / 2 + 1;
            const dir = dx === 0 ? 1 : Math.sign(dx);
            result[ids[i]] = { ...result[ids[i]], x: result[ids[i]].x - dir * shift };
            result[ids[j]] = { ...result[ids[j]], x: result[ids[j]].x + dir * shift };
          } else {
            const shift = overlapY / 2 + 1;
            const dir = dy === 0 ? 1 : Math.sign(dy);
            result[ids[i]] = { ...result[ids[i]], y: result[ids[i]].y - dir * shift };
            result[ids[j]] = { ...result[ids[j]], y: result[ids[j]].y + dir * shift };
          }
        }
      }
    }

    if (!moved) break;
  }

  // Keep all bubbles in visible area (accounting for centered positioning)
  for (const id of ids) {
    result[id] = {
      x: Math.max(BUBBLE_W / 2 + 8, result[id].x),
      y: Math.max(BUBBLE_H / 2 + 8, result[id].y),
    };
  }

  return result;
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
  const gameBoardRef = useRef(null);
  const paletteDragRef = useRef(null);
  const positionsRef = useRef(positions);
  const instancesRef = useRef(instances);
  const [paletteDrag, setPaletteDrag] = useState(null);
  const [boardDragOver, setBoardDragOver] = useState(false);
  const DRAG_THRESHOLD = 5;

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

        let gridIndex = 0;
        data.instances.forEach((inst) => {
          newInstances[inst.id] = {
            instanceId: inst.id,
            conceptId: inst.concept_id,
            name: inst.name,
            emoji: inst.emoji,
            isNewlyCombined: false,
          };

          if (inst.position_x != null && inst.position_y != null) {
            newPositions[inst.id] = { x: inst.position_x, y: inst.position_y };
          } else {
            const col = gridIndex % 4;
            const row = Math.floor(gridIndex / 4);
            newPositions[inst.id] = {
              x: 260 + col * (BUBBLE_W + 24),
              y: 200 + row * (BUBBLE_H + 20),
            };
            gridIndex++;
          }
        });

        setInstances(newInstances);
        setPositions(resolveOverlaps(newPositions));
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

  useEffect(() => { positionsRef.current = positions; }, [positions]);
  useEffect(() => { instancesRef.current = instances; }, [instances]);

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
    async (aInstanceId, bInstanceId, spawnPos, notificationPos) => {
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
          setBoardData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              discoveries: [
                ...(prev.discoveries || []),
                {
                  concept_id: resultConcept.id,
                  name: resultConcept.name,
                  emoji: resultConcept.emoji,
                },
              ],
            };
          });
        }

        if (result.complexityImproved) {
          displayNotification(
            `⬆️ ${resultConcept.name} complexity improved!`,
            notificationPos ?? spawnPos,
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
            x: spawnPos.x,
            y: spawnPos.y,
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

        // Positions are center-based (CSS translate(-50%,-50%)), so midpoint is just the average.
        // Add the board's viewport offset to convert from board-relative to fixed coords.
        const midX = (dragPos.x + targetPos.x) / 2;
        const midY = (dragPos.y + targetPos.y) / 2;
        const boardRect = gameBoardRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
        const notificationPosition = { x: midX + boardRect.left, y: midY + boardRect.top };

        playBeforeCombine();
        setIsCombining(true);

        setTimeout(async () => {
          const combined = await combineAndReplace(
            dragId,
            targetId,
            { x: (dragPos.x + targetPos.x) / 2, y: (dragPos.y + targetPos.y) / 2 },
            notificationPosition,
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
  const addConceptToBoard = useCallback(async (conceptId, explicitPosX, explicitPosY) => {
    let posX, posY;
    if (explicitPosX !== undefined && explicitPosY !== undefined) {
      posX = explicitPosX;
      posY = explicitPosY;
    } else {
      const sidebarOffset = isMobileOrTablet ? 0 : 220;
      const knowledgeOffset = isMobileOrTablet ? 0 : 320;
      const centerX =
        (window.innerWidth - sidebarOffset - knowledgeOffset) / 2 +
        sidebarOffset;
      const centerY = window.innerHeight / 2;
      posX = centerX + (Math.random() - 0.5) * 100;
      posY = centerY + (Math.random() - 0.5) * 100;
    }

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
  }, [boardId, isMobileOrTablet]);

  // ─── Spawn from panel then combine with a board element ─
  const spawnAndCombine = useCallback(async (panelItem, boardX, boardY, targetInstanceId) => {
    const targetInstance = instancesRef.current[targetInstanceId];
    if (!targetInstance) return;

    const targetPos = positionsRef.current[targetInstanceId];
    const midPos = {
      x: (boardX + (targetPos?.x ?? boardX)) / 2,
      y: (boardY + (targetPos?.y ?? boardY)) / 2,
    };

    playBeforeCombine();
    setIsCombining(true);

    try {
      const spawnResult = await boardsApi.spawn(boardId, {
        conceptId: panelItem.conceptId,
        positionX: boardX,
        positionY: boardY,
      });

      const newInst = spawnResult.instance;
      const newInstanceId = newInst.id;

      await new Promise((resolve) => setTimeout(resolve, 700));

      const boardRect = gameBoardRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const notificationPos = {
        x: midPos.x + boardRect.left,
        y: midPos.y + boardRect.top,
      };

      let combineResult = null;
      try {
        combineResult = await boardsApi.combine(boardId, {
          conceptAId: panelItem.conceptId,
          conceptBId: targetInstance.conceptId,
          instanceAId: newInstanceId,
          instanceBId: targetInstanceId,
        });
      } catch (combineErr) {
        console.error('Combine API error:', combineErr);
      }

      if (!combineResult?.success) {
        playCombineFail();

        setInstances((prev) => ({
          ...prev,
          [newInstanceId]: {
            instanceId: newInstanceId,
            conceptId: newInst.concept_id,
            name: newInst.name,
            emoji: newInst.emoji,
            isNewlyCombined: false,
          },
        }));
        setPositions((prev) => ({ ...prev, [newInstanceId]: { x: boardX, y: boardY } }));

        displayNotification('No recipe found!', notificationPos);
        setTimeout(() => clearNotification(), 2000);
      } else {
        playCombineSuccess();

        const newCombinedId = combineResult.newInstance.id;
        const resultConcept = combineResult.concept;

        if (combineResult.isNewDiscovery) {
          setDiscoveredConcepts((prev) => new Set([...prev, resultConcept.id]));
          setBoardData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              discoveries: [
                ...(prev.discoveries || []),
                { concept_id: resultConcept.id, name: resultConcept.name, emoji: resultConcept.emoji },
              ],
            };
          });
        }

        if (combineResult.complexityImproved) {
          displayNotification(`⬆️ ${resultConcept.name} complexity improved!`, notificationPos);
          setTimeout(() => clearNotification(), 2500);
        }

        setInstances((prev) => {
          const next = { ...prev };
          delete next[targetInstanceId];
          next[newCombinedId] = {
            instanceId: newCombinedId,
            conceptId: resultConcept.id,
            name: resultConcept.name,
            emoji: resultConcept.emoji,
            isNewlyCombined: true,
          };
          return next;
        });

        setPositions((prev) => {
          const next = { ...prev };
          delete next[targetInstanceId];
          next[newCombinedId] = { x: midPos.x, y: midPos.y };
          return next;
        });

        setZIndexes((prev) => {
          const next = { ...prev };
          delete next[targetInstanceId];
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to spawn and combine:', err);
    }

    setIsCombining(false);
  }, [boardId, playBeforeCombine, playCombineSuccess, playCombineFail]);

  // ─── Drag from knowledge panel to board ─────────────
  const handleKnowledgePointerDown = useCallback((e, item) => {
    if (isCombining) return;
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    paletteDragRef.current = {
      item,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      isDragging: false,
    };

    setPaletteDrag({
      item,
      currentX: clientX,
      currentY: clientY,
      isDragging: false,
    });
  }, [isCombining]);

  const handleKnowledgePointerMove = useCallback((e) => {
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
      item: ref.item,
      currentX: clientX,
      currentY: clientY,
      isDragging: ref.isDragging,
    });

    if (ref.isDragging && gameBoardRef.current) {
      const boardRect = gameBoardRef.current.getBoundingClientRect();
      const isOver =
        clientX >= boardRect.left &&
        clientX <= boardRect.right &&
        clientY >= boardRect.top &&
        clientY <= boardRect.bottom;
      setBoardDragOver(isOver);

      if (isOver) {
        const boardX = clientX - boardRect.left;
        const boardY = clientY - boardRect.top;
        const threshold = getHitRadius();
        const currentPositions = positionsRef.current;
        let closest = null;
        let closestDist = Infinity;
        for (const [id, pos] of Object.entries(currentPositions)) {
          const d = Math.hypot(boardX - pos.x, boardY - pos.y);
          if (d < threshold && d < closestDist) {
            closest = id;
            closestDist = d;
          }
        }
        setHoverTargetId(closest);
      } else {
        setHoverTargetId(null);
      }
    }
  }, []);

  const handleKnowledgePointerUp = useCallback((e) => {
    if (!paletteDragRef.current) return;

    const ref = paletteDragRef.current;
    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? ref.currentX;
    const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY ?? ref.currentY;

    if (ref.isDragging) {
      if (gameBoardRef.current) {
        const boardRect = gameBoardRef.current.getBoundingClientRect();
        const isOver =
          clientX >= boardRect.left &&
          clientX <= boardRect.right &&
          clientY >= boardRect.top &&
          clientY <= boardRect.bottom;

        if (isOver) {
          const boardX = clientX - boardRect.left;
          const boardY = clientY - boardRect.top;

          const threshold = getHitRadius();
          const currentPositions = positionsRef.current;
          let targetId = null;
          let closestDist = Infinity;
          for (const [id, pos] of Object.entries(currentPositions)) {
            const d = Math.hypot(boardX - pos.x, boardY - pos.y);
            if (d < threshold && d < closestDist) {
              targetId = id;
              closestDist = d;
            }
          }

          if (targetId) {
            spawnAndCombine(ref.item, boardX, boardY, targetId);
          } else {
            addConceptToBoard(ref.item.conceptId, boardX, boardY);
          }
        }
      }
    } else {
      addConceptToBoard(ref.item.conceptId);
    }

    paletteDragRef.current = null;
    setPaletteDrag(null);
    setBoardDragOver(false);
    setHoverTargetId(null);
  }, [addConceptToBoard, spawnAndCombine]);

  useEffect(() => {
    const onMove = (e) => handleKnowledgePointerMove(e);
    const onUp = (e) => handleKnowledgePointerUp(e);

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
  }, [handleKnowledgePointerMove, handleKnowledgePointerUp]);

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
          boardRef={gameBoardRef}
          className={`board-canvas${boardDragOver ? ' drag-over' : ''}`}
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
                    {items.map((item, idx) => {
                      const isBeingDragged =
                        paletteDrag?.isDragging &&
                        paletteDrag?.item?.conceptId === item.conceptId;
                      return (
                        <div
                          key={idx}
                          className={`category-item${isBeingDragged ? ' is-being-dragged' : ''}`}
                          onPointerDown={(e) => handleKnowledgePointerDown(e, item)}
                          onTouchStart={(e) => handleKnowledgePointerDown(e, item)}
                          title="Click or drag to add to board"
                          style={{ touchAction: 'none' }}
                        >
                          <span className="category-item-emoji">
                            {item.emoji}
                          </span>
                          <span className="category-item-name">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
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

      {/* Knowledge panel drag ghost */}
      {paletteDrag?.isDragging && (
        <div
          className="knowledge-drag-ghost"
          style={{
            left: paletteDrag.currentX,
            top: paletteDrag.currentY,
          }}
        >
          <span className="knowledge-drag-ghost-emoji">{paletteDrag.item.emoji}</span>
          <span className="knowledge-drag-ghost-name">{paletteDrag.item.name}</span>
        </div>
      )}
    </div>
  );
};

export default Board;