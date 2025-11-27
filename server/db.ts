import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Disable TLS rejection for Railway private endpoints
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('railway')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Handle SSL for Railway private proxy URLs - disable certificate validation
const connectionConfig: any = { connectionString: process.env.DATABASE_URL };
if (process.env.DATABASE_URL?.includes('railway.internal') || process.env.DATABASE_URL?.includes('switchback') || process.env.DATABASE_URL?.includes('railway.app')) {
  connectionConfig.ssl = 'require';
  connectionConfig.sslmode = 'require';
  // Disable strict SSL validation for private Railway endpoints
  if (process.env.DATABASE_URL?.includes('railway.internal') || process.env.DATABASE_URL?.includes('switchback')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
}

export const pool = new Pool(connectionConfig);
export const db = drizzle({ client: pool, schema });
