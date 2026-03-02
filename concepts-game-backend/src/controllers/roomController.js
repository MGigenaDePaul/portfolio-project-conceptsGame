import pool from '../database/db.js';
import { roomManager } from '../socket/roomManager.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
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

    // Generate unique code
    do {
      code = generateCode();
      const exists = await pool.query('SELECT id FROM rooms WHERE code = \$1', [code]);
      if (exists.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);

    // Save to DB
    const result = await pool.query(
      `INSERT INTO rooms (code, host_id, status) VALUES (\$1, \$2, 'waiting') RETURNING *`,
      [code, userId]
    );

    await pool.query(
      `INSERT INTO room_members (room_id, user_id) VALUES (\$1, \$2)`,
      [result.rows[0].id, userId]
    );

    // Create in-memory state
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

    // Check room exists in DB
    const roomResult = await pool.query(
      'SELECT * FROM rooms WHERE code = \$1 AND status != \$2',
      [code.toUpperCase(), 'closed']
    );
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found or closed' });
    }

    const room = roomResult.rows[0];

    // Check if already a member
    const memberCheck = await pool.query(
      'SELECT id FROM room_members WHERE room_id = \$1 AND user_id = \$2',
      [room.id, userId]
    );

    if (memberCheck.rows.length === 0) {
      // Check player count
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

    // Ensure in-memory room exists (if server restarted)
    if (!roomManager.getRoom(code.toUpperCase())) {
      const hostResult = await pool.query('SELECT username FROM users WHERE id = \$1', [room.host_id]);
      roomManager.createRoom(code.toUpperCase(), room.host_id, hostResult.rows[0].username);
    }

    res.json({ code: code.toUpperCase(), room });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const getRoomInfo = async (req, res) => {
  try {
    const { code } = req.params;
    const state = roomManager.serialize(code.toUpperCase());
    if (!state) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(state);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ error: 'Failed to get room info' });
  }
};