import pool from '../database/db.js';

export const getAllRecipes = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                r.id,
                r.ingredient1_id,
                r.ingredient2_id,
                r.result_id,
                c1.name as ingredient1_name,
                c1.emoji as indgredient1_emoji,
                c2.name as ingredient2_name,
                c2.emoji as ingredient2_emoji,
                c3.name as result_name,
                c3.emoji as result_emoji
            FROM recipes r
            JOIN concepts c1 ON r.ingredient1_id = c1.id
            JOIN concepts c2 ON r.ingredient2_id = c2.id
            JOIN concepts c3 ON r.result_id = c3.id
            ORDER BY r.id
        `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

// find recipe by two ingredients
export const findRecipe = async (req, res) => {
  try {
    const { ingredient1, ingredient2 } = req.query;

    if (!ingredient1 || !ingredient2) {
      return res.status(400).json({ error: 'Both ingredients are required' });
    }

    const result = await pool.query(`
            SELECT 
                r.*,
                c.name as result_name,
                c.emoji as result_emoji
            FROM recipes r
            JOIN concepts c ON r.result_id = c.id
            WHERE (r.ingredient1_id = $1 AND r.ingredient2_id = $2)
                OR (r.ingredient1_id = $2 AND r.ingredient2_id = $1)
            `, [ ingredient1, ingredient2 ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No recipe found' });
    }

    res.json(result.rows[0]);
  } catch(error){
    console.error('Error finding recipe', error);
    res.status(500).json({ error: 'Failed to find recipe' });
  }
};