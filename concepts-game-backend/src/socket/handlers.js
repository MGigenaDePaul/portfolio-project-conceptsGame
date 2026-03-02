import { roomManager } from './roomManager';
import { combine } from '../services/combineService.js';

const registerSocketHandlers = (io, socket) => {
  const user = socket.user; // { id, email } from JWT

  console.log(`🔌 Socket connected: ${user.username} (${socket.id})`);

  // ─── JOIN ROOM ────────────────────────────────────────
  socket.on('room:join', ({ code, username }) => {
    const room = roomManager.getRoom(code);
    if (!room) {
      return socket.emit('error', { message: 'Room not found' });
    }

    if (room.status !== 'waiting' && room.status !== 'playing') {
      return socket.emit('error', { message: 'Room is closed' });
    }

    const player = roomManager.addPlayer(code, socket.id, user.id, username);
    if (!player) {
      return socket.emit('error', { message: 'Room is full' });
    }

    // Track which room this socket is in
    socket.roomCode = code;
    socket.join(code);

    // Send full state to the joining player
    socket.emit('room:state', roomManager.serialize(code));

    // Notify others
    socket.to(code).emit('room:player-joined', {
      socketId: socket.id,
      userId: user.id,
      username,
      color: player.color,
    });

    console.log(`👤 ${username} joined room ${code}`);
  });

  // ─── START GAME (host only) ───────────────────────────
  socket.on('room:start', () => {
    const code = socket.roomCode;
    const room = roomManager.getRoom(code);
    if (!room) return;
    if (room.hostId !== user.id) {
      return socket.emit('error', { message: 'Only the host can start the game' });
    }

    room.status = 'playing';
    io.to(code).emit('room:started', roomManager.serialize(code));
    console.log(`🎮 Room ${code} started!`);
  });

  // ─── ELEMENT GRAB ─────────────────────────────────────
  socket.on('element:grab', ({ instanceId }) => {
    const code = socket.roomCode;
    const result = roomManager.grabElement(code, socket.id, instanceId);

    if (!result.success) {
      return socket.emit('element:grab-rejected', {
        instanceId,
        reason: result.reason,
      });
    }

    // Broadcast to ALL in room (including sender for confirmation)
    io.to(code).emit('element:grabbed', {
      instanceId,
      lockedBy: socket.id,
    });
  });

  // ─── ELEMENT MOVE (throttled by client) ────────────────
  socket.on('element:move', ({ instanceId, x, y }) => {
    const code = socket.roomCode;
    const element = roomManager.moveElement(code, socket.id, instanceId, x, y);
    if (!element) return;

    // Broadcast to others only (sender already moved it locally)
    socket.to(code).emit('element:moved', { instanceId, x, y });
  });

  // ─── ELEMENT RELEASE ──────────────────────────────────
  socket.on('element:release', ({ instanceId, x, y }) => {
    const code = socket.roomCode;
    const element = roomManager.releaseElement(code, socket.id, instanceId, x, y);
    if (!element) return;

    io.to(code).emit('element:released', { instanceId, x, y });
  });

  // ─── ELEMENT COMBINE ──────────────────────────────────
  socket.on('element:combine', async ({ instanceId1, instanceId2 }) => {
    const code = socket.roomCode;
    const room = roomManager.getRoom(code);
    if (!room) return;

    const el1 = room.elements.get(instanceId1);
    const el2 = room.elements.get(instanceId2);
    if (!el1 || !el2) return;

    // Only the player who is dragging one of them can combine
    if (el1.lockedBy !== socket.id && el2.lockedBy !== socket.id) return;

    try {
      const result = await combine(el1.conceptId, el2.conceptId);

      if (!result) {
        // No recipe — release the element back
        if (el1.lockedBy === socket.id) el1.lockedBy = null;
        if (el2.lockedBy === socket.id) el2.lockedBy = null;

        io.to(code).emit('element:combine-failed', {
          instanceId1,
          instanceId2,
        });
        return;
      }

      // Calculate position for new element (midpoint)
      const newX = (el1.x + el2.x) / 2;
      const newY = (el1.y + el2.y) / 2;

      // Remove the two combined elements
      roomManager.removeElement(code, instanceId1);
      roomManager.removeElement(code, instanceId2);

      // Add the new element
      const newElement = roomManager.addElement(
        code, result.id, result.name, result.emoji, newX, newY
      );

      // Broadcast to all players
      io.to(code).emit('element:combined', {
        removedIds: [instanceId1, instanceId2],
        newElement,
        combinedBy: socket.id,
      });

      console.log(`✨ ${el1.name} + ${el2.name} = ${result.name} in room ${code}`);
    } catch (err) {
      console.error('Combine error:', err);
      socket.emit('error', { message: 'Combine failed' });
    }
  });

  // ─── ADD ELEMENT FROM SIDEBAR ──────────────────────────
  socket.on('element:add', ({ conceptId, name, emoji, x, y }) => {
    const code = socket.roomCode;
    const newElement = roomManager.addElement(code, conceptId, name, emoji, x, y);
    if (!newElement) return;

    io.to(code).emit('element:added', newElement);
  });

  // ─── CURSOR MOVE ───────────────────────────────────────
  socket.on('cursor:move', ({ x, y }) => {
    const code = socket.roomCode;
    if (!code) return;

    socket.to(code).emit('cursor:moved', {
      socketId: socket.id,
      x,
      y,
    });
  });

  // ─── DISCONNECT ────────────────────────────────────────
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    if (!code) return;

    const result = roomManager.removePlayer(code, socket.id);
    if (!result) return;

    if (!result.roomDeleted) {
      io.to(code).emit('room:player-left', {
        socketId: socket.id,
        userId: user.id,
        username: result.player?.username,
      });

      // Send updated state
      const state = roomManager.serialize(code);
      if (state) io.to(code).emit('room:state', state);
    }

    console.log(`👋 ${result.player?.username} left room ${code}`);
  });
};

export default registerSocketHandlers;
