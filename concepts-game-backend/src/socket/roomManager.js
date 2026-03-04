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
    const availableConcepts = new Map();

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

      // Base elements are always available
      availableConcepts.set(el.conceptId, {
        conceptId: el.conceptId,
        name: el.name,
        emoji: el.emoji,
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
      availableConcepts,
    };

    this.rooms.set(code, room);
    return room;
  }

  // ─── LOAD (restore from database) ──────────────────
  async loadRoom(code) {
    try {
      const roomResult = await pool.query(
        'SELECT * FROM rooms WHERE code = $1',
        [code]
      );
      if (roomResult.rows.length === 0) return null;

      const dbRoom = roomResult.rows[0];

      const elementsResult = await pool.query(
        'SELECT * FROM room_elements WHERE room_code = $1',
        [code]
      );

      const discoveriesResult = await pool.query(
        'SELECT concept_id FROM room_discoveries WHERE room_code = $1',
        [code]
      );

      const elements = new Map();
      const availableConcepts = new Map();

      // Always add base elements to available
      STARTING_ELEMENTS.forEach(el => {
        availableConcepts.set(el.conceptId, {
          conceptId: el.conceptId,
          name: el.name,
          emoji: el.emoji,
        });
      });

      if (elementsResult.rows.length > 0) {
        elementsResult.rows.forEach(row => {
          elements.set(row.instance_id, {
            instanceId: row.instance_id,
            conceptId: row.concept_id,
            name: row.name,
            emoji: row.emoji,
            x: row.x,
            y: row.y,
            lockedBy: null,
          });

          // Also add to available concepts
          if (!availableConcepts.has(row.concept_id)) {
            availableConcepts.set(row.concept_id, {
              conceptId: row.concept_id,
              name: row.name,
              emoji: row.emoji,
            });
          }
        });
        console.log(`📦 Loaded ${elements.size} elements for room ${code}`);
      } else {
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

      // Load full concept info for discoveries so they appear in palette
      if (discoveries.size > 0) {
        const conceptIds = Array.from(discoveries);
        const conceptsResult = await pool.query(
          'SELECT id, name, emoji FROM concepts WHERE id = ANY($1)',
          [conceptIds]
        );
        conceptsResult.rows.forEach(row => {
          if (!availableConcepts.has(row.id)) {
            availableConcepts.set(row.id, {
              conceptId: row.id,
              name: row.name,
              emoji: row.emoji,
            });
          }
        });
      }

      const room = {
        code,
        hostId: dbRoom.host_id,
        status: dbRoom.status === 'paused' ? 'playing' : dbRoom.status,
        maxPlayers: dbRoom.max_players,
        players: new Map(),
        elements,
        discoveries,
        availableConcepts,
      };

      this.rooms.set(code, room);

      await pool.query(
        "UPDATE rooms SET status = 'playing' WHERE code = $1",
        [code]
      );

      console.log(`🔄 Room ${code} restored from database (${elements.size} elements, ${discoveries.size} discoveries, ${availableConcepts.size} available concepts)`);
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

      await pool.query(
        "UPDATE rooms SET status = 'paused' WHERE code = $1",
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

  async removePlayer(code, socketId) {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.get(socketId);
    room.players.delete(socketId);

    for (const [, el] of room.elements) {
      if (el.lockedBy === socketId) {
        el.lockedBy = null;
      }
    }

    if (room.players.size === 0) {
      console.log(`📤 Room ${code} is empty, saving state...`);
      await this.saveRoom(code);
      this.rooms.delete(code);
      return { player, roomDeleted: true };
    }

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

    // Also add to available concepts if new
    if (!room.availableConcepts.has(conceptId)) {
      room.availableConcepts.set(conceptId, {
        conceptId,
        name,
        emoji,
      });
    }

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

    const availableConcepts = [];
    for (const [, concept] of room.availableConcepts) {
      availableConcepts.push({ ...concept });
    }

    return {
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players,
      elements,
      availableConcepts,
      discoveryCount: room.discoveries.size,
    };
  }
}

export const roomManager = new RoomManager();