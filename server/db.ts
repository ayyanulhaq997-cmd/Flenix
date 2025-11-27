import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
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

// Configure SSL for Railway endpoints
const sslConfig = process.env.DATABASE_URL?.includes('railway') 
  ? { rejectUnauthorized: false }
  : false;

const client = postgres(process.env.DATABASE_URL, {
  ssl: sslConfig,
  max: 10,
  idle_timeout: 20,
});

export const db = drizzle({ client, schema });
