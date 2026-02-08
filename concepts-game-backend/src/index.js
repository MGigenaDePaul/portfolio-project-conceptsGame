import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './database/schema.js';
import { seedConcepts, seedRecipes } from './database/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Concepts Game API is running! 🎮' });
});

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