// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Initialize PostgreSQL pool
const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'development' ? {
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: true,
    ca: process.env.POSTGRES_SSL_CA ? process.env.POSTGRES_SSL_CA : undefined
  }
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Export functions to get clients
export function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }
  return supabase;
}

export function getPostgresPool() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.error('Missing PostgreSQL environment variables');
    throw new Error('Missing PostgreSQL environment variables');
  }
  return postgresPool;
}

// Add connection tests
(async () => {
  try {
    // Test PostgreSQL connection
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      try {
        await postgresPool.query('SELECT NOW()');
        console.log('PostgreSQL connection successful');
      } catch (error) {
        console.error('PostgreSQL connection failed:', error);
      }
    }

    // Test Supabase connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection test successful');
        }
      } catch (error) {
        console.error('Supabase connection test failed:', error);
      }
    }
  } catch (error) {
    console.error('Connection test failed:', error);
  }
})();

export default {
  supabase,
  postgresPool
};
