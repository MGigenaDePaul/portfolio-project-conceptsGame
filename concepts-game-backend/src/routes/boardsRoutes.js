import express from 'express';
import {
    createBoard,
    getUserBoards,
    getBoard,
    deleteBoard
} from '../controllers/boardsController.js'
import { combineConcepts } from '../controllers/combineController.js';

const router = express.Router();

// POST /api/boards - Create a new board
router.post('/', createBoard)

// GET /api/boards/user/:userId - Get all boards for a user
router.get('/user/:userId', getUserBoards)

// GET /api/boards/:id - Get a specific board with all data
router.get('/:id', getBoard)

// DELETE /api/boards/:id - Delete a board
router.delete('/:id', deleteBoard)

// POST /api/boards/:boardId/combine - Combine two concepts
router.post('/:boardId/combine', combineConcepts) 

export default router;