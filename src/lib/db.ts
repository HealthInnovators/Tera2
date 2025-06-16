// src/lib/db.ts
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
