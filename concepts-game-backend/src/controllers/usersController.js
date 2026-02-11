import pool from '../database/db.js'

export const createUser = async (req, res) => {
    try {
        const { username, email, password_hash} = req.body;

        if (!username || !email || !password_hash) {
            return res.status(400).json({ error: 'Username, email, and password hash are required' })
        }

        const result = await pool.query(`
            INSERT INTO users (username, email, password_hash)
            `)
    } catch(error) {

    }
}