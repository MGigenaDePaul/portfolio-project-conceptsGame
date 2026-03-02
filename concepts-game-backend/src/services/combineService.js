import pool from '../database/db.js';

/**
 * Attempt to combine two concepts.
 * Returns the resulting concept or null if no recipe exists.
 * Adjust column names to match YOUR recipes/concepts tables.
 */

const combine = async (conceptId1, conceptId2) => {
    const result = await pool.query(
        `SELECT c.id, c.name, c.emoji
         FROM recipes r
         JOIN concepts c ON c.id = r.result_id
         WHERE (r.input1_id = $1 AND r.input2_id = $2)
            OR (r.input1_id = $2 AND r.input2_id = $1)
         LIMIT 1`,
         [conceptId1, conceptId2]
        )
    
    if (result.rows.length === 0) return null;
    return result.rows[0]; // { id, name, emoji }
}