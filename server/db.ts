import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Disable TLS rejection for Railway endpoints
if (process.env.DATABASE_URL?.includes('railway') || process.env.DATABASE_URL?.includes('switchback')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

export const db = drizzle({ client: pool, schema });
