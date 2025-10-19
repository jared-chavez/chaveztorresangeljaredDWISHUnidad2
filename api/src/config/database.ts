import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load env from api/.env; if missing, fall back to project root .env
dotenv.config();
if (!process.env.PGHOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'cruduser',
  password: process.env.PGPASSWORD || 'crudpass',
  database: process.env.PGDATABASE || 'crud31',
});

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }>{
  const result = await pool.query(text, params);
  return result as { rows: T[] };
}

export async function getClient() {
  return pool.connect();
}
