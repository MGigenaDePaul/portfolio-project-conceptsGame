import { v4 as uuidv4 } from 'uuid';

const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#74B9FF', '#FD79A8'
];

// Starting elements — adjust IDs/names to match your concepts table
const STARTING_ELEMENTS = [
  { conceptId: 'fire',  name: 'Fire',  emoji: '🔥' },
  { conceptId: 'water', name: 'Water', emoji: '💧' },
  { conceptId: 'earth', name: 'Earth', emoji: '🌍' },
  { conceptId: 'air',   name: 'Air',   emoji: '🌬️' },
];

class RoomManager {
  constructor() {
    // Map<roomCode, RoomState>
    this.rooms = new Map();
  }

  createRoom(code, hostId, hostUsername) {
    const elements = new Map();

    // Place starting elements on the board
    STARTING_ELEMENTS.forEach((el, i) => {
      const instanceId = uuidv4();
      elements.set(instanceId, {
        instanceId,
        conceptId: el.conceptId,
        name: el.name,
        emoji: el.emoji,
        x: 150 + (i % 2) * 250,
        y: 150 + Math.floor(i / 2) * 250,
        lockedBy: null,     // socketId of player dragging it, or null
      });
    });

    const room = {
      code,
      hostId,
      status: 'waiting', // waiting | playing
      maxPlayers: 4,
      players: new Map(), // Map<socketId, PlayerInfo>
      elements,
      discoveries: new Set(), // conceptIds discovered this session
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code);
  }

  addPlayer(code, socketId, userId, username) {
    const room = this.rooms.get(code);
    if (!room) return null;
    if (room.players.size >= room.maxPlayers) return null;

    // Check if user already in room (reconnect)
    for (const [sid, player] of room.players) {
      if (player.userId === userId) {
        // Remove old socket entry
        room.players.delete(sid);
        // Unlock any elements locked by old socket
        for (const [, el] of room.elements) {
          if (el.lockedBy === sid) el.lockedBy = null;
        }
        break;
      }
    }

    const colorIndex = room.players.size % PLAYER_COLORS.length;
    const player = {
      userId,
      username,
      color: PLAYER_COLORS[colorIndex],
      cursorX: 0,
      cursorY: 0,
    };

    room.players.set(socketId, player);
    return player;
  }

  removePlayer(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.get(socketId);
    room.players.delete(socketId);

    // Unlock any elements this player was dragging
    for (const [, el] of room.elements) {
      if (el.lockedBy === socketId) {
        el.lockedBy = null;
      }
    }

    // If room is empty, clean up
    if (room.players.size === 0) {
      this.rooms.delete(code);
      return { player, roomDeleted: true };
    }

    // If host left, transfer to next player
    if (player && player.userId === room.hostId) {
      const nextPlayer = room.players.values().next().value;
      if (nextPlayer) room.hostId = nextPlayer.userId;
    }

    return { player, roomDeleted: false };
  }

  grabElement(code, socketId, instanceId) {
    const room = this.rooms.get(code);
    if (!room) return { success: false, reason: 'Room not found' };

    const element = room.elements.get(instanceId);
    if (!element) return { success: false, reason: 'Element not found' };

    // Already locked by someone else
    if (element.lockedBy && element.lockedBy !== socketId) {
      return { success: false, reason: 'Element is being dragged by another player' };
    }

    element.lockedBy = socketId;
    return { success: true, element };
  }

  moveElement(code, socketId, instanceId, x, y) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const element = room.elements.get(instanceId);
    if (!element || element.lockedBy !== socketId) return null;

    element.x = x;
    element.y = y;
    return element;
  }

  releaseElement(code, socketId, instanceId, x, y) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const element = room.elements.get(instanceId);
    if (!element || element.lockedBy !== socketId) return null;

    element.lockedBy = null;
    element.x = x;
    element.y = y;
    return element;
  }

  addElement(code, conceptId, name, emoji, x, y) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const instanceId = uuidv4();
    const element = {
      instanceId,
      conceptId,
      name,
      emoji,
      x,
      y,
      lockedBy: null,
    };

    room.elements.set(instanceId, element);
    room.discoveries.add(conceptId);
    return element;
  }

  removeElement(code, instanceId) {
    const room = this.rooms.get(code);
    if (!room) return;
    room.elements.delete(instanceId);
  }

  // Serialize room state for sending to clients
  serialize(code) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const players = [];
    for (const [socketId, p] of room.players) {
      players.push({ socketId, ...p });
    }

    const elements = [];
    for (const [, el] of room.elements) {
      elements.push({ ...el });
    }

    return {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players,
      elements,
      discoveryCount: room.discoveries.size,
    };
  }
}

export const roomManager = new RoomManager();