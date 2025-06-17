// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { Pool, PoolClient } from 'pg';

// Initialize PostgreSQL pool with improved SSL configuration
let postgresPool: Pool | null = null;

// Initialize database connection
async function initializeDatabase(): Promise<Pool> {
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.error('Missing database URL environment variable');
      throw new Error('Missing database URL environment variable');
    }

    postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
        ca: process.env.POSTGRES_SSL_CA,
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3'
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000 // Return an error after 5 seconds if connection could not be established
    });

    // Test connection
    await postgresPool.query('SELECT 1');
    console.log('PostgreSQL connection successful');
    return postgresPool;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    postgresPool = null;
    throw error;
  }
}

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization failed. Application may not function correctly.');
  }
})();

// Get the database pool with initialization check
function getPostgresPool(): Pool {
  if (!postgresPool) {
    throw new Error('Database not initialized. Please call initializeDatabase() first.');
  }
  return postgresPool;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Export database clients
export const db = {
  supabase,
  getPostgresPool
};

// Add type definitions
export type DatabaseClients = typeof db;

// Export connection test functions
export function testDatabaseConnection(): Promise<boolean> {
  try {
    const pool = getPostgresPool();
    return pool.query('SELECT 1').then(() => true);
  } catch (error) {
    console.error('Database connection test failed:', error);
    return Promise.resolve(false);
  }
}

export function getSupabaseClient(): any {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }
  return db.supabase;
}
