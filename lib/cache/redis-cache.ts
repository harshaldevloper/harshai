import { Redis } from 'ioredis';

/**
 * Redis Cache Layer
 * 
 * Provides caching functionality using Redis for:
 * - API response caching
 * - Session storage
 * - Rate limiting
 * - Real-time data
 */

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class RedisCache {
  private redis: Redis;
  private defaultTTL: number;

  constructor(redisUrl?: string, defaultTTL: number = 300) {
    this.redis = new Redis(redisUrl || process.env.UPSTASH_REDIS_REST_URL!);
    this.defaultTTL = defaultTTL;

    // Error handling
    this.redis.on('error', (err) => {
      console.error('Redis cache error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Redis cache connected');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const effectiveTTL = ttl ?? this.defaultTTL;
      
      if (effectiveTTL > 0) {
        await this.redis.setex(key, effectiveTTL, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache invalidate error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, by = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, by);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, by = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, by);
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get or set with fallback function
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, ttl);
    return value;
  }

  // ==================== Cache Helpers ====================

  /**
   * User-specific cache keys
   */
  async getUserWorkflows(userId: string) {
    return this.get(`user:${userId}:workflows`);
  }

  async setUserWorkflows(userId: string, workflows: any[], ttl = 300) {
    await this.set(`user:${userId}:workflows`, workflows, ttl);
  }

  async invalidateUserWorkflows(userId: string) {
    await this.invalidate(`user:${userId}:workflows`);
  }

  /**
   * Workflow cache
   */
  async getWorkflow(workflowId: string) {
    return this.get(`workflow:${workflowId}`);
  }

  async setWorkflow(workflowId: string, workflow: any, ttl = 60) {
    await this.set(`workflow:${workflowId}`, workflow, ttl);
  }

  async invalidateWorkflow(workflowId: string) {
    await this.invalidate(`workflow:${workflowId}`);
  }

  /**
   * Execution cache
   */
  async getExecution(executionId: string) {
    return this.get(`execution:${executionId}`);
  }

  async setExecution(executionId: string, execution: any, ttl = 3600) {
    await this.set(`execution:${executionId}`, execution, ttl);
  }

  /**
   * Rate limiting
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;
    
    const current = await this.increment(windowKey);
    if (current === 1) {
      await this.set(windowKey, 0, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const resetAt = (Math.floor(now / windowSeconds) + 1) * windowSeconds;

    return {
      allowed: current <= limit,
      remaining,
      resetAt,
    };
  }

  /**
   * Session management
   */
  async setSession(sessionId: string, data: any, ttl = 86400) {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string) {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string) {
    await this.delete(`session:${sessionId}`);
  }

  /**
   * API response caching
   */
  async cacheApiResponse(
    endpoint: string,
    response: any,
    ttl = 60
  ) {
    await this.set(`api:${endpoint}`, response, ttl);
  }

  async getCachedApiResponse(endpoint: string) {
    return this.get(`api:${endpoint}`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

// Singleton instance
let cacheInstance: RedisCache | null = null;

export function getCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache();
  }
  return cacheInstance;
}

export const cache = getCache();
