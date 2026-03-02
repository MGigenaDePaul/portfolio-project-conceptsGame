import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './database/schema.js';
import { createServer } from 'http';
import { seedConcepts, seedRecipes } from './database/seed.js';
import conceptsRoutes from './routes/conceptsRoutes.js'
import recipesRoutes from './routes/recipesRoutes.js'
import boardsRoutes from './routes/boardsRoutes.js'
import usersRoutes from './routes/usersRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import authenticate from './middleware/auth.js';
import { setupSocket } from './socket/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Create HTTP server & attach Socket.IO ──────────────
const httpServer = createServer(app);          // ← ADD
const io = setupSocket(httpServer);            // ← ADD

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",              
    "https://concepts-game.onrender.com" // url frontend
  ],
  credentials: true
}));
app.use(express.json());

app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Concepts Game API is running! 🎮' });
});

app.use('/api/auth', authRoutes);
app.use('/api/concepts', conceptsRoutes);
app.use('/api/boards', authenticate, boardsRoutes);
app.use('/api/users', authenticate, usersRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/rooms', authenticate, roomRoutes);


// Initialize database
const initializeDatabase = async () => {
  await createTables();
  await seedConcepts();
  await seedRecipes();
};

initializeDatabase().catch(console.error);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});