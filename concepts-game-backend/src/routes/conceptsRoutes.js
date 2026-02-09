import express from 'express';
import { getAllConcepts,  getConceptById} from '../controllers/conceptsController.js';

const router = express.Router();

router.get('/', getAllConcepts);

router.get('/:id', getConceptById);

export default router;

