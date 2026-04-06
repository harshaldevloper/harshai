/**
 * Rate Limiter - Day 40
 * Rate limiting for workflow executions
 */

import { prisma } from './prisma';

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

export interface RateLimitConfig {
  perMinute?: number;
  perHour?: number;
  perDay?: number;
  concurrent?: number;
}

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  userId: string,
  workflowId: string,
  config?: RateLimitConfig
): Promise<RateLimitStatus> {
  const limits = config || await getDefaultLimits(userId);
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  // Count requests in last minute
  const count = await prisma.rateLimitLog.count({
    where: {
      userId,
      workflowId,
      timestamp: { gte: oneMinuteAgo },
      allowed: true
    }
  });

  const limit = limits.perMinute || 60;
  const remaining = Math.max(0, limit - count);
  const allowed = remaining > 0;

  // Calculate reset time (end of current minute window)
  const resetAt = new Date(now.getTime() + 60 * 1000);

  // Log the rate limit check
  await prisma.rateLimitLog.create({
    data: {
      userId,
      workflowId,
      action: 'execution',
      allowed,
      limit,
      remaining: allowed ? remaining - 1 : 0,
      resetAt
    }
  });

  return {
    allowed,
    limit,
    remaining: allowed ? remaining - 1 : 0,
    resetAt,
    retryAfter: allowed ? undefined : Math.ceil((resetAt.getTime() - now.getTime()) / 1000)
  };
}

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(
  userId: string,
  workflowId: string
): Promise<void> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + 60 * 1000);

  await prisma.rateLimitLog.create({
    data: {
      userId,
      workflowId,
      action: 'execution',
      allowed: true,
      limit: 60,
      remaining: 59,
      resetAt
    }
  });
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(
  userId: string,
  workflowId: string
): Promise<RateLimitStatus> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  const count = await prisma.rateLimitLog.count({
    where: {
      userId,
      workflowId,
      timestamp: { gte: oneMinuteAgo },
      allowed: true
    }
  });

  const limit = 60; // Default
  const remaining = Math.max(0, limit - count);
  const resetAt = new Date(now.getTime() + 60 * 1000);

  return {
    allowed: remaining > 0,
    limit,
    remaining,
    resetAt
  };
}

/**
 * Reset rate limit counters
 */
export async function resetRateLimit(
  userId: string,
  workflowId?: string
): Promise<void> {
  const where: any = {
    userId,
    timestamp: { lt: new Date() }
  };

  if (workflowId) {
    where.workflowId = workflowId;
  }

  await prisma.rateLimitLog.deleteMany({
    where
  });
}

/**
 * Sliding window rate limit check
 */
export async function slidingWindowCheck(
  userId: string,
  workflowId: string,
  windowMs: number,
  maxRequests: number
): Promise<RateLimitStatus> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const count = await prisma.rateLimitLog.count({
    where: {
      userId,
      workflowId,
      timestamp: { gte: windowStart },
      allowed: true
    }
  });

  const remaining = Math.max(0, maxRequests - count);
  const allowed = remaining > 0;
  const resetAt = new Date(now.getTime() + windowMs);

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetAt,
    retryAfter: allowed ? undefined : Math.ceil((resetAt.getTime() - now.getTime()) / 1000)
  };
}

/**
 * Token bucket rate limit check
 */
export async function tokenBucketCheck(
  userId: string,
  workflowId: string,
  bucketSize: number,
  refillRate: number // tokens per second
): Promise<RateLimitStatus> {
  // Get last check time
  const lastCheck = await prisma.rateLimitLog.findFirst({
    where: { userId, workflowId },
    orderBy: { timestamp: 'desc' }
  });

  const now = new Date();
  let tokens = bucketSize;

  if (lastCheck) {
    const elapsed = (now.getTime() - lastCheck.timestamp.getTime()) / 1000; // seconds
    const refilled = elapsed * refillRate;
    tokens = Math.min(bucketSize, (lastCheck.remaining || 0) + refilled);
  }

  const allowed = tokens >= 1;
  const remaining = allowed ? Math.floor(tokens - 1) : Math.floor(tokens);
  const resetAt = new Date(now.getTime() + (bucketSize - remaining) / refillRate * 1000);

  return {
    allowed,
    limit: bucketSize,
    remaining,
    resetAt,
    retryAfter: allowed ? undefined : Math.ceil((1 - tokens) / refillRate)
  };
}

/**
 * Get default limits for user
 */
async function getDefaultLimits(userId: string): Promise<RateLimitConfig> {
  const { getRateLimit } = await import('./quota-manager');
  
  try {
    const limits = await getRateLimit(userId);
    return {
      perMinute: limits.perMinute,
      perHour: limits.perHour,
      perDay: limits.perDay,
      concurrent: limits.concurrent
    };
  } catch {
    return {
      perMinute: 10,
      perHour: 100,
      perDay: 1000,
      concurrent: 5
    };
  }
}

/**
 * Check concurrent execution limit
 */
export async function checkConcurrentLimit(
  userId: string,
  maxConcurrent: number
): Promise<boolean> {
  // Count currently running executions
  const runningCount = await prisma.execution.count({
    where: {
      userId,
      status: 'running'
    }
  });

  return runningCount < maxConcurrent;
}
