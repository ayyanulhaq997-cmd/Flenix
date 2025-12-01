import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient: Redis | null = null;
let redisAvailable = false;

export function initRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  try {
    redisClient = new Redis(REDIS_URL, {
      retryStrategy: () => null, // Don't retry, just fail fast
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: true, // Don't connect immediately
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      console.log('[redis] Connected to Redis cache');
    });

    redisClient.on('error', () => {
      redisAvailable = false;
      // Silently fail - don't spam logs
    });

    // Try connecting without blocking
    redisClient.connect().catch(() => {
      redisAvailable = false;
    });
  } catch (error) {
    redisClient = null;
    redisAvailable = false;
  }

  return redisClient;
}

export function getRedis(): Redis | null {
  return redisAvailable && redisClient ? redisClient : null;
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
