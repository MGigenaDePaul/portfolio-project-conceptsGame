import pool from '../database/db.js'

export const createUser = async (req, res) => {
    try {
        const { username, email, password_hash} = req.body;

        if (!username || !email || !password_hash) {
            return res.status(400).json({ error: 'Username, email, and password hash are required' })
        }

        const result = await pool.query(`
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3) RETURNING id, username, email, created_at
            `, [username, email, password_hash])
    } catch(error) {
        if (error.code === '23505') {// unique violation
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error('Error creating user', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, email, created_at FROM users ORDER BY created_at DESC
            `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT id, username, email, created_at FROM users WHERE id = $1`, 
            [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Note: This will fail if user has boards (foreign key constraint)
        // You might want to delete boards first or use CASCADE
        const result =  await pool.query(`
            DELETE FROM users WHERE id = $1 RETURNING id, username
            `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            return res.status(409).json({
                error: 'Cannot delete user with existing boards. Delete boards first.'
            })
        }
        console.error('Error deleting user', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};