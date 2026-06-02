import express from 'express';
import { getGlobalLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/global', getGlobalLeaderboard);

export default router;
