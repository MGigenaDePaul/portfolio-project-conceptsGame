import express from 'express';
import { getAllRecipes, findRecipe } from '../controllers/recipesController.js';

const router = express.Router();

router.get('/', getAllRecipes);

router.get('/find', findRecipe);

export default router;