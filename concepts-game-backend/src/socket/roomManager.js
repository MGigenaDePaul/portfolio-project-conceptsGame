import { v4 as uuidv4 } from 'uuid';
import pool from '../database/db.js';

const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#74B9FF', '#FD79A8'
];

const STARTING_ELEMENTS = [
  { conceptId: 'fire',  name: 'Fire',  emoji: '🔥' },
  { conceptId: 'water', name: 'Water', emoji: '💧' },
  { conceptId: 'earth', name: 'Earth', emoji: '🌍' },
  { conceptId: 'air',   name: 'Air',   emoji: '🌬️' },
];

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  // ─── CREATE (brand new room) ───────────────────────
  createRoom(code, hostId, hostUsername) {
    const elements = new Map();

    STARTING_ELEMENTS.forEach((el, i) => {
      const instanceId = uuidv4();
      elements.set(instanceId, {
        instanceId,
        conceptId: el.conceptId,
        name: el.name,
        emoji: el.emoji,
        x: 150 + (i % 2) * 250,
        y: 150 + Math.floor(i / 2) * 250,
        lockedBy: null,
      });
    });

    const room = {
      code,
      hostId,
      status: 'waiting',
      maxPlayers: 4,
      players: new Map(),
      elements,
      discoveries: new Set(),
    };

    this.rooms.set(code, room);
    return room;
  }

  // ─── LOAD (restore from database) ──────────────────
  async loadRoom(code) {
    try {
      // Get room info from DB
      const roomResult = await pool.query(
        'SELECT * FROM rooms WHERE code = $1',
        [code]
      );
      if (roomResult.rows.length === 0) return null;

      const dbRoom = roomResult.rows[0];

      // Load saved elements
      const elementsResult = await pool.query(
        'SELECT * FROM room_elements WHERE room_code = $1',
        [code]
      );

      // Load saved discoveries
      const discoveriesResult = await pool.query(
        'SELECT concept_id FROM room_discoveries WHERE room_code = $1',
        [code]
      );

      const elements = new Map();

      if (elementsResult.rows.length > 0) {
        // Restore saved elements
        elementsResult.rows.forEach(row => {
          elements.set(row.instance_id, {
            instanceId: row.instance_id,
            conceptId: row.concept_id,
            name: row.name,
            emoji: row.emoji,
            x: row.x,
            y: row.y,
            lockedBy: null, // No one is dragging on load
          });
        });
        console.log(`📦 Loaded ${elements.size} elements for room ${code}`);
      } else {
        // No saved elements — start fresh with starting elements
        STARTING_ELEMENTS.forEach((el, i) => {
          const instanceId = uuidv4();
          elements.set(instanceId, {
            instanceId,
            conceptId: el.conceptId,
            name: el.name,
            emoji: el.emoji,
            x: 150 + (i % 2) * 250,
            y: 150 + Math.floor(i / 2) * 250,
            lockedBy: null,
          });
        });
        console.log(`🆕 No saved elements for room ${code}, using starting elements`);
      }

      const discoveries = new Set();
      discoveriesResult.rows.forEach(row => {
        discoveries.add(row.concept_id);
      });

      const room = {
        code,
        hostId: dbRoom.host_id,
        status: dbRoom.status === 'paused' ? 'playing' : dbRoom.status,
        maxPlayers: dbRoom.max_players,
        players: new Map(),
        elements,
        discoveries,
      };

      this.rooms.set(code, room);

      // Update DB status back to playing
      await pool.query(
        'UPDATE rooms SET status = \'playing\' WHERE code = \$1',
        [code]
      );

      console.log(`🔄 Room ${code} restored from database (${elements.size} elements, ${discoveries.size} discoveries)`);
      return room;
    } catch (err) {
      console.error(`❌ Failed to load room ${code}:`, err);
      return null;
    }
  }

  // ─── SAVE (persist to database) ────────────────────
  async saveRoom(code) {
    const room = this.rooms.get(code);
    if (!room) return;

    try {
    // ─── Save elements ─────────────────────────────
      await pool.query(
        'DELETE FROM room_elements WHERE room_code = $1',
        [code]
      );

      const elements = Array.from(room.elements.values());
      for (const el of elements) {
        await pool.query(
          `INSERT INTO room_elements (room_code, instance_id, concept_id, name, emoji, x, y)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [code, el.instanceId, el.conceptId, el.name, el.emoji, el.x, el.y]
        );
      }

      // ─── Save discoveries ──────────────────────────
      await pool.query(
        'DELETE FROM room_discoveries WHERE room_code = $1',
        [code]
      );

      const discoveries = Array.from(room.discoveries);
      for (const conceptId of discoveries) {
        await pool.query(
          `INSERT INTO room_discoveries (room_code, concept_id)
         VALUES ($1, $2)`,
          [code, conceptId]
        );
      }

      // ─── Update room status ────────────────────────
      await pool.query(
        'UPDATE rooms SET status = \'paused\' WHERE code = \$1',
        [code]
      );

      console.log(`💾 Room ${code} saved (${elements.length} elements, ${discoveries.length} discoveries)`);
    } catch (err) {
      console.error(`❌ Failed to save room ${code}:`, err);
    }
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
        room.players.delete(sid);
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

  // ─── REMOVE PLAYER (save when room empties) ────────
  async removePlayer(code, socketId) {
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

    // If room is empty → save to DB and remove from memory
    if (room.players.size === 0) {
      console.log(`📤 Room ${code} is empty, saving state...`);
      await this.saveRoom(code);
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