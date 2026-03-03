import pool from '../database/db.js';
import { roomManager } from '../socket/roomManager.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    let code;
    let attempts = 0;

    do {
      code = generateCode();
      const exists = await pool.query('SELECT id FROM rooms WHERE code = \$1', [code]);
      if (exists.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);

    const result = await pool.query(
      `INSERT INTO rooms (code, host_id, status) VALUES (\$1, \$2, 'waiting') RETURNING *`,
      [code, userId]
    );

    await pool.query(
      `INSERT INTO room_members (room_id, user_id) VALUES (\$1, \$2)`,
      [result.rows[0].id, userId]
    );

    const userResult = await pool.query('SELECT username FROM users WHERE id = \$1', [userId]);
    roomManager.createRoom(code, userId, userResult.rows[0].username);

    res.status(201).json({ code, room: result.rows[0] });
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const upperCode = code.toUpperCase();

    // Check room exists in DB (allow waiting, playing, OR paused)
    const roomResult = await pool.query(
      "SELECT * FROM rooms WHERE code = \$1 AND status != 'closed'",
      [upperCode]
    );
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found or closed' });
    }

    const room = roomResult.rows[0];

    // Add to room_members if not already
    const memberCheck = await pool.query(
      'SELECT id FROM room_members WHERE room_id = \$1 AND user_id = \$2',
      [room.id, userId]
    );

    if (memberCheck.rows.length === 0) {
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM room_members WHERE room_id = \$1',
        [room.id]
      );
      if (parseInt(countResult.rows[0].count) >= room.max_players) {
        return res.status(400).json({ error: 'Room is full' });
      }

      await pool.query(
        'INSERT INTO room_members (room_id, user_id) VALUES (\$1, \$2)',
        [room.id, userId]
      );
    }

    // If room is NOT in memory → load from database
    if (!roomManager.getRoom(upperCode)) {
      console.log(`📥 Room ${upperCode} not in memory, loading from database...`);
      const loaded = await roomManager.loadRoom(upperCode);

      if (!loaded) {
        // Room exists in DB but has no saved state — create fresh
        const hostResult = await pool.query('SELECT username FROM users WHERE id = \$1', [room.host_id]);
        roomManager.createRoom(upperCode, room.host_id, hostResult.rows[0].username);
        console.log(`🆕 Created fresh room ${upperCode} (no saved state found)`);
      }
    }

    res.json({ code: upperCode, room });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const getRoomInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase();

    // Try in-memory first
    let state = roomManager.serialize(upperCode);

    if (!state) {
      // Check if room exists in DB
      const roomResult = await pool.query(
        "SELECT * FROM rooms WHERE code = \$1 AND status != 'closed'",
        [upperCode]
      );
      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const room = roomResult.rows[0];

      // Count saved elements
      const elemCount = await pool.query(
        'SELECT COUNT(*) FROM room_elements WHERE room_code = \$1',
        [upperCode]
      );
      const discCount = await pool.query(
        'SELECT COUNT(*) FROM room_discoveries WHERE room_code = \$1',
        [upperCode]
      );

      // Return basic info without loading into memory
      return res.json({
        code: upperCode,
        hostId: room.host_id,
        status: room.status,
        maxPlayers: room.max_players,
        players: [],
        elements: [],
        elementCount: parseInt(elemCount.rows[0].count),
        discoveryCount: parseInt(discCount.rows[0].count),
        isPaused: room.status === 'paused',
      });
    }

    res.json(state);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to get room info' });
  }
};