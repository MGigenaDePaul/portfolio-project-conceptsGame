import express from 'express';
import { register, login, me } from '../controllers/authController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register); // POST /api/auth/register
router.post('/login', login);       // POST /api/auth/login
router.get('/me', authenticate, me);// GET /api/auth/me (protected)

export default router;