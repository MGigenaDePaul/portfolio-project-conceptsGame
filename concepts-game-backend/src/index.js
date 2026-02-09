import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './database/schema.js';
import { seedConcepts, seedRecipes } from './database/seed.js';
import conceptsRoutes from './routes/conceptsRoutes.js'
import recipesRoutes from './routes/recipesRoutes.js'

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

app.use('/api/concepts', conceptsRoutes);
app.use('/api/recipes', recipesRoutes);

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