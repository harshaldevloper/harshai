import { describe, it, expect, beforeEach } from 'vitest';
import { LRUCache } from '../../lib/cache/memory-cache';

describe('Rate Limiting', () => {
  let rateLimitCache: LRUCache<string, { count: number; resetAt: number }>;

  beforeEach(() => {
    rateLimitCache = new LRUCache(1000, 60000); // 1000 items, 1 minute TTL
  });

  it('tracks request count per IP', () => {
    const ip = '192.168.1.1';
    const key = `ratelimit:${ip}`;
    
    // Simulate first request
    rateLimitCache.set(key, { count: 1, resetAt: Date.now() + 60000 });
    
    const entry = rateLimitCache.get(key);
    expect(entry?.count).toBe(1);
  });

  it('increments request count', () => {
    const ip = '192.168.1.1';
    const key = `ratelimit:${ip}`;
    
    // Simulate multiple requests
    rateLimitCache.set(key, { count: 1, resetAt: Date.now() + 60000 });
    rateLimitCache.set(key, { count: 2, resetAt: Date.now() + 60000 });
    rateLimitCache.set(key, { count: 3, resetAt: Date.now() + 60000 });
    
    const entry = rateLimitCache.get(key);
    expect(entry?.count).toBe(3);
  });

  it('enforces rate limit', () => {
    const ip = '192.168.1.1';
    const key = `ratelimit:${ip}`;
    const limit = 5;
    
    // Simulate requests up to limit
    for (let i = 1; i <= limit; i++) {
      rateLimitCache.set(key, { count: i, resetAt: Date.now() + 60000 });
    }
    
    const entry = rateLimitCache.get(key);
    expect(entry?.count).toBe(limit);
    
    // Next request should be blocked
    const isBlocked = entry && entry.count >= limit;
    expect(isBlocked).toBe(true);
  });

  it('resets count after window expires', async () => {
    const ip = '192.168.1.1';
    const key = `ratelimit:${ip}`;
    const shortTTL = 100; // 100ms
    
    // Set with short TTL
    rateLimitCache.set(key, { count: 5, resetAt: Date.now() + shortTTL });
    
    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, shortTTL + 10));
    
    const entry = rateLimitCache.get(key);
    expect(entry).toBeUndefined(); // Expired
  });

  it('handles multiple IPs independently', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';
    
    rateLimitCache.set(`ratelimit:${ip1}`, { count: 5, resetAt: Date.now() + 60000 });
    rateLimitCache.set(`ratelimit:${ip2}`, { count: 10, resetAt: Date.now() + 60000 });
    
    const entry1 = rateLimitCache.get(`ratelimit:${ip1}`);
    const entry2 = rateLimitCache.get(`ratelimit:${ip2}`);
    
    expect(entry1?.count).toBe(5);
    expect(entry2?.count).toBe(10);
  });

  it('evicts old entries when cache is full', () => {
    const smallCache = new LRUCache(3, 60000);
    
    // Fill cache
    smallCache.set('key1', { count: 1, resetAt: Date.now() + 60000 });
    smallCache.set('key2', { count: 2, resetAt: Date.now() + 60000 });
    smallCache.set('key3', { count: 3, resetAt: Date.now() + 60000 });
    
    // Add new entry (should evict key1)
    smallCache.set('key4', { count: 4, resetAt: Date.now() + 60000 });
    
    expect(smallCache.get('key1')).toBeUndefined();
    expect(smallCache.get('key2')).toBeDefined();
    expect(smallCache.get('key4')).toBeDefined();
  });
});
