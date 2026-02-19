import pool from './db.js';
import { CONCEPTS } from '../../../concepts-game-frontend/src/game/concepts.js';
import { RECIPES } from '../../../concepts-game-frontend/src/game/recipes.js';

// Helper to create a concept if it doesn't exist
const ensureConceptExists = async (conceptId) => {
  try {
    // Check if concept already exists
    const existing = await pool.query(
      'SELECT id FROM concepts WHERE id = $1',
      [conceptId]
    );
    
    if (existing.rows.length === 0) {
      // Create a default concept (you can improve this later)
      const name = conceptId.charAt(0).toUpperCase() + conceptId.slice(1); // nombres empiezan en mayuscula
      await pool.query(
        `INSERT INTO concepts (id, name, emoji) 
         VALUES ($1, $2, $3)`,
        [conceptId, name, '❓'] // Default emoji for auto-generated concepts
      );
      console.log(`  ➕ Created concept: ${conceptId}`);
    }
  } catch (error) {
    console.error(`Error ensuring concept ${conceptId} exists:`, error);
  }
};

export const seedConcepts = async () => {
  try {
    console.log('🌱 Seeding concepts...');
    
    for (const concept of Object.entries(CONCEPTS)) {
      await pool.query(
        `INSERT INTO concepts (id, name, emoji) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (id) DO NOTHING`,
        [concept.id, concept.name, concept.emoji]
      );
    }
    
    console.log('✅ Concepts seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding concepts:', error);
  }
};

export const seedRecipes = async () => {
  try {
    console.log('🌱 Seeding recipes...');
    
    for (const [pairKey, resultId] of Object.entries(RECIPES)) {
      const [ingredient1, ingredient2] = pairKey.split(':');
      
      // Ensure all concepts exist before creating the recipe
      await ensureConceptExists(ingredient1);
      await ensureConceptExists(ingredient2);
      await ensureConceptExists(resultId);
      
      await pool.query(
        `INSERT INTO recipes (ingredient1_id, ingredient2_id, result_id) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (ingredient1_id, ingredient2_id) DO NOTHING`,
        [ingredient1, ingredient2, resultId]
      );
    }
    
    console.log('✅ Recipes seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding recipes:', error);
  }
};