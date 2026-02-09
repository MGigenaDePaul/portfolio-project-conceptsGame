import pool from './db.js';

export const createTables = async () => {
  try {
    // "Hey PostgreSQL, make a table called 'concepts' if you don't have one already. Here are the columns:"    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS concepts (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Concepts table ready');

    // 2. Recipes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        ingredient1_id VARCHAR(50) NOT NULL,
        ingredient2_id VARCHAR(50) NOT NULL,
        result_id VARCHAR(50) NOT NULL,
        FOREIGN KEY (ingredient1_id) REFERENCES concepts(id),
        FOREIGN KEY (ingredient2_id) REFERENCES concepts(id),
        FOREIGN KEY (result_id) REFERENCES concepts(id),
        UNIQUE(ingredient1_id, ingredient2_id)
      );
    `);
    console.log('✅ Recipes table ready');

    // 3. Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table ready');

    // 4. Boards table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      );
    `);
    console.log('✅ Boards table ready');

    // 5. Board discoveries (which concepts a board has found and their complexity)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_discoveries (
        id SERIAL PRIMARY KEY,
        board_id INTEGER NOT NULL,
        concept_id VARCHAR(50) NOT NULL,
        complexity INTEGER NOT NULL,
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (concept_id) REFERENCES concepts(id),
        UNIQUE(board_id, concept_id)
      );
    `);
    console.log('✅ Board discoveries table ready');

    // 6. Board instances (current elements on the board)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_instances (
        id VARCHAR(100) PRIMARY KEY,
        board_id INTEGER NOT NULL,
        concept_id VARCHAR(50) NOT NULL,
        position_x FLOAT,
        position_y FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (concept_id) REFERENCES concepts(id)
      );
    `);
    console.log('✅ Board instances table ready');

    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};