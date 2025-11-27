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

// Use standard postgres client for Railway compatibility
const connectionConfig: any = { 
  connectionString: process.env.DATABASE_URL,
  ssl: false
};

// For Railway public/private endpoints, use SSL but don't verify
if (process.env.DATABASE_URL?.includes('railway')) {
  connectionConfig.ssl = 'require';
}

const client = postgres(connectionConfig);
export const db = drizzle({ client, schema });
