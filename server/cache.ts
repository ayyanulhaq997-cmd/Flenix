import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient: Redis | null = null;

export function initRedis(): Redis {
  if (!redisClient) {
    try {
      redisClient = new Redis(REDIS_URL);
      redisClient.on('connect', () => {
        console.log('[redis] Connected to Redis cache');
      });
      redisClient.on('error', (err) => {
        console.error('[redis] Connection error:', err.message);
      });
    } catch (error) {
      console.warn('[redis] Failed to connect - caching disabled');
      return null as any;
    }
  }
  return redisClient;
}

export function getRedis(): Redis | null {
  return redisClient;
}

// Cache utilities
const CACHE_EXPIRY = 300; // 5 minutes default

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn(`[redis] Get error for key ${key}:`, error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, expiry = CACHE_EXPIRY): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    await redis.setex(key, expiry, JSON.stringify(value));
  } catch (error) {
    console.warn(`[redis] Set error for key ${key}:`, error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`[redis] Invalidate error for pattern ${pattern}:`, error);
  }
}

// Cache key generators
export const cacheKeys = {
  movies: () => 'cache:movies:all',
  movieById: (id: number) => `cache:movies:${id}`,
  series: () => 'cache:series:all',
  seriesById: (id: number) => `cache:series:${id}`,
  channels: () => 'cache:channels:all',
  channelById: (id: number) => `cache:channels:${id}`,
  stats: () => 'cache:stats',
  subscriptionPlans: () => 'cache:subscription-plans',
  searchMovies: (query: string, genre?: string) => `cache:search:movies:${query}:${genre || ''}`,
  searchSeries: (query: string, genre?: string) => `cache:search:series:${query}:${genre || ''}`,
};
