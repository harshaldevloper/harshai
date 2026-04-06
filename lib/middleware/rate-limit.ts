import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cache } from '../cache/redis-cache';

/**
 * Rate Limiting Configuration
 */
interface RateLimitConfig {
  limit: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
  message: string; // Error message when limit exceeded
}

/**
 * Default rate limit configurations
 */
export const rateLimitConfigs = {
  // General API endpoints
  general: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests, please try again later.',
  },
  
  // Authentication endpoints (stricter)
  auth: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many authentication attempts, please try again later.',
  },
  
  // Workflow creation (stricter)
  workflowCreate: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many workflow creation attempts, please slow down.',
  },
  
  // Webhook endpoints (moderate)
  webhook: {
    limit: 50,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many webhook requests, please try again later.',
  },
  
  // File uploads (very strict)
  upload: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many upload attempts, please try again later.',
  },
};

/**
 * Rate limiting middleware factory
 */
export function rateLimit(config: RateLimitConfig = rateLimitConfigs.general) {
  return async (request: NextRequest) => {
    // Get client identifier (IP address or user ID)
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const userId = request.headers.get('x-user-id') ?? ip;
    const key = `ratelimit:${userId}`;
    
    // Check rate limit
    const result = await cache.checkRateLimit(
      key,
      config.limit,
      Math.floor(config.windowMs / 1000)
    );
    
    // Create response with rate limit headers
    const headers = {
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetAt.toString(),
    };
    
    if (!result.allowed) {
      return NextResponse.json(
        { 
          error: config.message,
          retryAfter: result.resetAt - Math.floor(Date.now() / 1000),
        },
        { 
          status: 429,
          headers,
        }
      );
    }
    
    // Return success response with headers
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  };
}

/**
 * Rate limit by endpoint
 */
export function rateLimitByEndpoint(endpoint: string) {
  let config: RateLimitConfig;
  
  if (endpoint.includes('/api/auth')) {
    config = rateLimitConfigs.auth;
  } else if (endpoint.includes('/api/workflows') && endpoint.includes('POST')) {
    config = rateLimitConfigs.workflowCreate;
  } else if (endpoint.includes('/api/webhooks')) {
    config = rateLimitConfigs.webhook;
  } else if (endpoint.includes('/api/upload')) {
    config = rateLimitConfigs.upload;
  } else {
    config = rateLimitConfigs.general;
  }
  
  return rateLimit(config);
}

/**
 * Check rate limit without creating middleware
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.general
) {
  const key = `ratelimit:${identifier}`;
  
  return cache.checkRateLimit(
    key,
    config.limit,
    Math.floor(config.windowMs / 1000)
  );
}

/**
 * Reset rate limit for an identifier
 */
export async function resetRateLimit(identifier: string) {
  const key = `ratelimit:${identifier}`;
  await cache.delete(key);
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.general
) {
  const key = `ratelimit:${identifier}`;
  const current = await cache.get<{ count: number }>(key);
  
  return {
    limit: config.limit,
    remaining: Math.max(0, config.limit - (current?.count ?? 0)),
    resetAt: Math.floor(Date.now() / 1000) + Math.floor(config.windowMs / 1000),
  };
}
