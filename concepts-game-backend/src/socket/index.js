import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../database/db.js';
import registerSocketHandlers from './handlers.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://concepts-game.onrender.com',
      ],
      credentials: true,
    },
  });

  // ─── Auth middleware: verify JWT on connection ─────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch username from DB
      const result = await pool.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [decoded.id]
      );
      if (result.rows.length === 0) return next(new Error('User not found'));

      socket.user = result.rows[0]; // { id, username, email }
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection handler ────────────────────────────────
  io.on('connection', (socket) => {
    registerSocketHandlers(io, socket);
  });

  return io;
}