import { Pool } from 'pg';

// Create PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false // Only for development, should be true in production
  }
});

// Connection test
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connection successful');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  }
})();

export default pool;
