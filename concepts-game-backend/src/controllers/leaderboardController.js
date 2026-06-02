import pool from '../database/db.js';

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.id            AS board_id,
        b.name          AS board_name,
        u.id            AS user_id,
        u.username,
        COUNT(bd.concept_id)::int                   AS discoveries,
        COALESCE(SUM(bd.complexity), 0)::int        AS total_complexity
      FROM boards b
      JOIN users u ON b.owner_id = u.id
      LEFT JOIN board_discoveries bd ON bd.board_id = b.id
      GROUP BY b.id, b.name, u.id, u.username
      ORDER BY discoveries DESC, total_complexity ASC
      LIMIT 100
    `);

    const rows = result.rows.map((row, i) => ({ rank: i + 1, ...row }));
    res.json(rows);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
