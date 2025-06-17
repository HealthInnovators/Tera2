import { getPostgresPool, testDatabaseConnection } from './db';
import { PoolClient } from 'pg';

export async function getDatabaseClient(): Promise<PoolClient> {
  const pool = getPostgresPool();
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    throw new Error('Database connection failed');
  }
  return await pool.connect();
}

export async function testConnection(): Promise<boolean> {
  return await testDatabaseConnection();
}
