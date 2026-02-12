import pool from '../database/db.js'

export const createBoard = async (req, res) => {
    try {
        const { name, owner_id } = req.body;

        if (!name || !owner_id) {
            return res.status(400).json({ error: 'Name and owner_id required' });
        }

        const result = await pool.query(`
            INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING *
            `, [name, owner_id]);
        
        const board = result.rows[0];

        // Get the actual concept IDs from the database
        const conceptsResult = await pool.query(`
            SELECT id FROM concepts WHERE id IN ('fire', 'water', 'earth', 'air')
        `);
        
        const startingConcepts = conceptsResult.rows.map(row => row.id);
        console.log('starting concepts', startingConcepts)
        // if (startingConcepts.concepts.length === 0) {
        //     console.error('⚠️ No starting concepts found!');
        // }
        // Loop through concepts and create discoveries + instances
        for (const conceptId of startingConcepts) {
            // Add to discoveries with complexity 1
            await pool.query(
                `INSERT INTO board_discoveries (board_id, concept_id, complexity)
                 VALUES ($1, $2, 1)`,
                [board.id, conceptId]
            );

            // Create 2 instances of each concept on the board
            for (let i = 0; i < 2; i++) {
                const instanceId = `instance-${board.id}-${conceptId}-${i}`;
                await pool.query(`  
                    INSERT INTO board_instances (id, board_id, concept_id, position_x, position_y)
                    VALUES ($1, $2, $3, $4, $5)`,
                    [instanceId, board.id, conceptId, Math.random() * 500, Math.random() * 500]
                );
            }
        }

        res.status(201).json(board)
    } catch (error) {
      console.error('Error creating board:', error.message);
      console.error('Full error:', error); // Log the whole error
      res.status(500).json({ error: error.message })
    }
}

// Get all boards for a user
export const getUserBoards = async (req, res) => {
    try {
        const {userId} = req.params;

        // "Get all boards where the owner is this user, newest first"
        const result = await pool.query(`
            SELECT * FROM boards WHERE owner_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        res.json(result.rows)
    } catch(error){
      console.error('Error fetching boards', error);
      res.status(500).json({ error: 'Failed to fetch boards' });
    }
};

// Get a single board with all its data
export const getBoard = async (req, res) => {
    try {
        const { id } = req.params

        // get board info
        const boardResult = await pool.query(`SELECT * FROM boards WHERE id = $1`, [id]);

        if (boardResult.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const board = boardResult.rows[0];

        // get discoveries
        const discoveriesResult = await pool.query(`
            SELECT bd.*, c.name, c.emoji
            FROM board_discoveries bd
            JOIN concepts c ON bd.concept_id = c.id
            WHERE bd.board_id = $1
            ORDER BY bd.discovered_at DESC
            `, [id])

        // get instances
        const instancesResult = await pool.query(`
            SELECT bi.*, c.name, c.emoji
            FROM board_instances bi
            JOIN concepts c ON bi.concept_id = c.id
            WHERE bi.board_id = $1
            `,[id])

        res.json({
            ...board,
            discoveries: discoveriesResult.rows,
            instances: instancesResult.rows
        })
    } catch(error) {
        console.error('Error fetching board', error)
        res.status(500).json({ error: 'Failed to fetch board' });
    }
}

// Delete a board
export const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params 

        const result = await pool.query(`DELETE FROM boards WHERE id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json({ message: 'Board deleted successfully' });
    } catch(error) {
        console.error('Error deleting board', error);
        res.status(500).json({ error: 'Failed to delete board' });
    }
}