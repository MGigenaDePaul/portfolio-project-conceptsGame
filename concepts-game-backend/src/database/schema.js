import pool from './db.js';

export const createTables = async () => {
  try {
    // 1. Concepts table   
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
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
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
    
    // 7. Rooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        host_id INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'waiting',
        max_players INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Rooms table ready');

    // 8. Room members
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_members (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      );
    `);
    console.log('✅ Room members table ready');

     // 9. Room elements (persist board state)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_elements (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(8) NOT NULL,
        instance_id VARCHAR(100) NOT NULL,
        concept_id VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        x FLOAT NOT NULL,
        y FLOAT NOT NULL,
        UNIQUE(room_code, instance_id)
      );
    `);
    console.log('✅ Room elements table ready');

    // 10. Room discoveries (persist discoveries)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_discoveries (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(8) NOT NULL,
        concept_id VARCHAR(100) NOT NULL,
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_code, concept_id)
      );
    `);
    console.log('✅ Room discoveries table ready');



    console.log('🎉 All tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};