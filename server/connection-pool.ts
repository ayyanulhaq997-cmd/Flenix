import { Pool } from "pg";

interface PoolConfig {
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxUses?: number;
}

export function createOptimizedPool(
  connectionString: string,
  config?: PoolConfig
): Pool {
  const poolConfig: PoolConfig = {
    // For 1000-3000 concurrent users
    max: parseInt(process.env.DB_POOL_MAX || "50", 10),
    min: parseInt(process.env.DB_POOL_MIN || "10", 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    maxUses: 7500,
    ...config,
  };

  const pool = new Pool({
    connectionString,
    ...poolConfig,
    application_name: "fenix-backend",
  });

  pool.on("error", (error) => {
    console.error("Unexpected error on idle client", error);
  });

  pool.on("connect", () => {
    console.log(`[DB Pool] New connection established. Total: ${pool.totalCount}`);
  });

  return pool;
}

export function getPoolStats(pool: Pool) {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    active: pool.totalCount - pool.idleCount,
  };
}
