import { useState, useEffect, useCallback } from 'react';

export function useMultiplayerBoard(socket, emit, on, off) {
  const [roomState, setRoomState] = useState(null);
  const [elements, setElements] = useState(new Map());
  const [players, setPlayers] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const [status, setStatus] = useState('waiting');
  const [availableConcepts, setAvailableConcepts] = useState([]);

  useEffect(() => {
    const handlers = {
      'room:state': (state) => {
        setRoomState(state);
        setStatus(state.status);
        setPlayers(state.players);
        setAvailableConcepts(state.availableConcepts || []);

        const elMap = new Map();
        state.elements.forEach(el => elMap.set(el.instanceId, el));
        setElements(elMap);
      },

      'room:started': (state) => {
        setRoomState(state);
        setStatus('playing');
        setPlayers(state.players);
        setAvailableConcepts(state.availableConcepts || []);
        const elMap = new Map();
        state.elements.forEach(el => elMap.set(el.instanceId, el));
        setElements(elMap);
      },

      'room:player-joined': (player) => {
        setPlayers(prev => [...prev.filter(p => p.socketId !== player.socketId), player]);
      },

      'room:player-left': ({ socketId }) => {
        setPlayers(prev => prev.filter(p => p.socketId !== socketId));
        setCursors(prev => {
          const next = new Map(prev);
          next.delete(socketId);
          return next;
        });
      },

      'element:grabbed': ({ instanceId, lockedBy }) => {
        setElements(prev => {
          const next = new Map(prev);
          const el = next.get(instanceId);
          if (el && lockedBy !== socket.current?.id) {
            next.set(instanceId, { ...el, lockedBy });
          }
          return next;
        });
      },

      'element:moved': ({ instanceId, x, y }) => {
        setElements(prev => {
          const next = new Map(prev);
          const el = next.get(instanceId);
          if (el) next.set(instanceId, { ...el, x, y });
          return next;
        });
      },

      'element:released': ({ instanceId, x, y }) => {
        setElements(prev => {
          const next = new Map(prev);
          const el = next.get(instanceId);
          if (el && el.lockedBy !== socket.current?.id) {
            next.set(instanceId, { ...el, x, y, lockedBy: null });
          }
          return next;
        });
      },

      'element:combined': ({ removedIds, newElement }) => {
        setElements(prev => {
          const next = new Map(prev);
          removedIds.forEach(id => next.delete(id));
          next.set(newElement.instanceId, newElement);
          return next;
        });

        // Add to available concepts if it's new
        setAvailableConcepts(prev => {
          const exists = prev.some(c => c.conceptId === newElement.conceptId);
          if (exists) return prev;
          return [...prev, {
            conceptId: newElement.conceptId,
            name: newElement.name,
            emoji: newElement.emoji,
          }];
        });
      },

      'element:combine-failed': ({ instanceId1, instanceId2 }) => {
        setElements(prev => {
          const next = new Map(prev);
          [instanceId1, instanceId2].forEach(id => {
            const el = next.get(id);
            if (el) next.set(id, { ...el, lockedBy: null });
          });
          return next;
        });
      },

      'element:added': (newElement) => {
        setElements(prev => {
          const next = new Map(prev);
          next.set(newElement.instanceId, newElement);
          return next;
        });
      },

      'cursor:moved': ({ socketId, username, x, y }) => {
        setCursors(prev => {
          const next = new Map(prev);
          next.set(socketId, { x, y, username });
          return next;
        });
      },

      'element:grab-rejected': ({ instanceId, reason }) => {
        console.log(`Grab rejected: ${reason}`);
        setElements(prev => {
          const next = new Map(prev);
          const el = next.get(instanceId);
          if (el && el.lockedBy === socket.current?.id) {
            next.set(instanceId, { ...el, lockedBy: null });
          }
          return next;
        });
      },

      'error': ({ message }) => {
        console.error('Socket error:', message);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        off(event, handler);
      });
    };
  }, [on, off, socket]);

  const joinRoom = useCallback((code, username) => {
    emit('room:join', { code, username });
  }, [emit]);

  const startGame = useCallback(() => {
    emit('room:start');
  }, [emit]);

  const grabElement = useCallback((instanceId) => {
    setElements(prev => {
      const next = new Map(prev);
      const el = next.get(instanceId);
      if (el) next.set(instanceId, { ...el, lockedBy: socket.current?.id });
      return next;
    });
    emit('element:grab', { instanceId });
  }, [emit, socket]);

  const moveElement = useCallback((instanceId, x, y) => {
    setElements(prev => {
      const next = new Map(prev);
      const el = next.get(instanceId);
      if (el) next.set(instanceId, { ...el, x, y });
      return next;
    });
    emit('element:move', { instanceId, x, y });
  }, [emit]);

  const releaseElement = useCallback((instanceId, x, y) => {
    setElements(prev => {
      const next = new Map(prev);
      const el = next.get(instanceId);
      if (el) next.set(instanceId, { ...el, x, y, lockedBy: null });
      return next;
    });
    emit('element:release', { instanceId, x, y });
  }, [emit]);

  const combineElements = useCallback((instanceId1, instanceId2) => {
    emit('element:combine', { instanceId1, instanceId2 });
  }, [emit]);

  const addElement = useCallback((conceptId, name, emoji, x, y) => {
    emit('element:add', { conceptId, name, emoji, x, y });
  }, [emit]);

  const moveCursor = useCallback((x, y) => {
    emit('cursor:move', { x, y });
  }, [emit]);

  return {
    roomState,
    elements,
    players,
    cursors,
    status,
    availableConcepts,
    joinRoom,
    startGame,
    grabElement,
    moveElement,
    releaseElement,
    combineElements,
    addElement,
    moveCursor,
  };
}