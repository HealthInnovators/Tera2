// src/lib/db.ts
<<<<<<< HEAD
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
=======
import { Pool } from 'pg';

// Ensure that environment variables are loaded.
// Next.js typically handles .env.local, .env.development, etc.
// For non-NEXT_PUBLIC variables, they are only available server-side.

if (!process.env.DATABASE_URL) {
 console.error('DATABASE_URL is not set');
 throw new Error('DATABASE_URL is not set');
}

console.log('Using database connection string:', process.env.DATABASE_URL);

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: {
   rejectUnauthorized: false
 }
});

// Add connection test on startup
(async () => {
 try {
   const client = await pool.connect();
   const result = await client.query('SELECT NOW()');
   console.log('Database connection test successful:', result.rows[0]);
   client.release();
 } catch (error) {
   console.error('Database connection test failed:', error);
   // Don't throw here as it might prevent the app from starting
 }
})();

pool.on('error', (err, client) => {
 console.error('Unexpected error on idle PostgreSQL client', err);
 // process.exit(-1); // Consider if you want to exit on pool errors
});

export async function checkDbConnection() {
 let client;
 try {
   client = await pool.connect();
   await client.query('SELECT NOW()'); // Simple query to check connection
   console.log('PostgreSQL connected successfully.');
   return true;
 } catch (error) {
   console.error('Failed to connect to PostgreSQL:', error);
   return false;
 } finally {
   if (client) {
     client.release();
   }
 }
}

// Optional: Perform an initial connection check when the module loads
// (async () => {
//   await checkDbConnection();
// })();

export default pool;
>>>>>>> origin/main
