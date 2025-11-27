import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Handle SSL verification for Railway private proxy URLs
const connectionConfig: any = { connectionString: process.env.DATABASE_URL };
if (process.env.DATABASE_URL?.includes('railway.internal') || process.env.DATABASE_URL?.includes('switchback')) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(connectionConfig);
export const db = drizzle({ client: pool, schema });
