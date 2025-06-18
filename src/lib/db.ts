// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { Pool, PoolClient } from 'pg';

// Initialize PostgreSQL pool with improved SSL configuration
let postgresPool: Pool | null = null;
let isInitializing = false;
let initializationAttempts = 0;
const MAX_INITIALIZATION_ATTEMPTS = 3;

// Initialize database connection
async function initializeDatabase(): Promise<Pool> {
  if (isInitializing) {
    throw new Error('Database initialization is already in progress');
  }

  isInitializing = true;
  initializationAttempts++;
  
  try {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.error('Missing database URL environment variable');
      throw new Error('Missing database URL environment variable');
    }

    console.log('Initializing PostgreSQL pool...');
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
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
      connection: async (config: any) => {
        console.log('Attempting to connect to PostgreSQL...');
        const client = new PoolClient(config);
        await new Promise<void>((resolve, reject) => {
          client.connect((err: Error | null) => {
            if (err) {
              console.error('Connection error:', err);
              reject(err);
            } else {
              console.log('Connected to PostgreSQL');
              resolve();
            }
          });
        });
        return client;
      }
    });

    // Test connection
    console.log('Testing PostgreSQL connection...');
    await postgresPool.query('SELECT 1');
    console.log('PostgreSQL connection successful');
    return postgresPool;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    if (initializationAttempts < MAX_INITIALIZATION_ATTEMPTS) {
      console.log(`Retrying database initialization (attempt ${initializationAttempts}/${MAX_INITIALIZATION_ATTEMPTS})...`);
      return initializeDatabase(); // Retry initialization
    }
    postgresPool = null;
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization failed. Application may not function correctly:', error);
    // Don't throw here to allow individual requests to retry initialization
  }
})();

// Get the database pool with initialization check
async function getPostgresPool(): Promise<Pool> {
  if (!postgresPool) {
    try {
      console.log('Initializing database connection...');
      postgresPool = await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
  async getPostgresPool() {
    return await getPostgresPool();
  }
};

// Add type definitions
export type DatabaseClients = typeof db;

// Export connection test functions
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const pool = await getPostgresPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export function getSupabaseClient(): any {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }
  return db.supabase;
}
