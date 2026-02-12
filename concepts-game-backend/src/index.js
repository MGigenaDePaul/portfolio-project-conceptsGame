import express from 'express';
import pool from './database/db.js'
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './database/schema.js';
import { seedConcepts, seedRecipes } from './database/seed.js';
import conceptsRoutes from './routes/conceptsRoutes.js'
import recipesRoutes from './routes/recipesRoutes.js'
import boardsRoutes from './routes/boardsRoutes.js'
import usersRoutes from './routes/usersRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Concepts Game API is running! 🎮' });
});

/// Temporary test route - IMPROVED
app.get('/test-board', async (req, res) => {
  try {
    // Create a test user
    const userResult = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (\$1, \$2, \$3) RETURNING *',
      ['testuser' + Date.now(), 'test' + Date.now() + '@example.com', 'dummy_hash']
    );
    
    const userId = userResult.rows[0].id;
    
    // Create a board directly by calling the controller
    const mockReq = { body: { name: 'My First Board', owner_id: userId } };
    const mockRes = {
      status: (code) => ({
        json: (data) => ({ code, data })
      }),
      json: (data) => data
    };
    
    await boardsController.createBoard(mockReq, mockRes);
    
    res.json({ 
      success: true, 
      userId, 
      message: 'Test board created!' 
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/concepts', conceptsRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/users', usersRoutes);


// Initialize database
const initializeDatabase = async () => {
  await createTables();
  await seedConcepts();
  await seedRecipes();
};

initializeDatabase().catch(console.error);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});