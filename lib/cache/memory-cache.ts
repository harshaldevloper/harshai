/**
 * In-Memory LRU Cache
 * 
 * Lightweight in-memory cache with LRU (Least Recently Used) eviction.
 * Useful for caching hot data that doesn't need to persist across restarts.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private defaultTTL: number; // in milliseconds

  constructor(maxSize: number = 100, defaultTTL: number = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL; // 5 minutes default
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    
    if (entry === undefined) {
      return undefined;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key: K, value: V, ttl?: number): void {
    // If key exists, remove it first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Delete oldest (first) item - LRU eviction
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Delete value from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all values
   */
  values(): V[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  /**
   * Get cache entries
   */
  entries(): Array<[K, V]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    maxSize: number;
    utilization: number;
    defaultTTL: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100,
      defaultTTL: this.defaultTTL,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let deleted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Get or set with fallback function
   */
  getOrSet(key: K, fallback: () => V, ttl?: number): V {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const value = fallback();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get or set with async fallback function
   */
  async getOrSetAsync(
    key: K,
    fallback: () => Promise<V>,
    ttl?: number
  ): Promise<V> {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const value = await fallback();
    this.set(key, value, ttl);
    return value;
  }
}

// Pre-configured cache instances
export const workflowCache = new LRUCache<string, any>(50, 60000); // 50 items, 1 min TTL
export const userCache = new LRUCache<string, any>(100, 300000); // 100 items, 5 min TTL
export const apiCache = new LRUCache<string, any>(200, 60000); // 200 items, 1 min TTL
export const sessionCache = new LRUCache<string, any>(500, 3600000); // 500 items, 1 hour TTL

// Export default instance
export default LRUCache;
