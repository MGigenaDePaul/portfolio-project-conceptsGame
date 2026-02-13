import pool from '../database/db.js';

// Get all concepts
export const getAllConcepts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM concepts ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching concepts:', error);
    res.status(500).json({ error: 'Failed to fetch concepts' });
  }
};

// Get a single concept by id
export const getConceptById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM concepts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Concept not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching concept:', error);
    res.status(500).json({ error: 'Failed to fetch concept' });
  }
};