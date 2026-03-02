import express from 'express';
import { createRoom, joinRoom, getRoomInfo } from '../controllers/roomController.js';

const router = express.Router();

router.post('/create', createRoom);           // POST /api/rooms/create
router.post('/join', joinRoom);               // POST /api/rooms/join
router.get('/:code', getRoomInfo);            // GET  /api/rooms/:code

export default router;