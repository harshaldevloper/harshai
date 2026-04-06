/**
 * Quota Manager - Day 40
 * Manage user quotas and usage limits
 */

import { prisma } from './prisma';

export interface QuotaStatus {
  hasQuota: boolean;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate: Date;
  plan: string;
}

export interface QuotaLimits {
  free: { runsLimit: number; rateLimitPerMinute: number; concurrentLimit: number };
  pro: { runsLimit: number; rateLimitPerMinute: number; concurrentLimit: number };
  business: { runsLimit: number; rateLimitPerMinute: number; concurrentLimit: number };
  enterprise: { runsLimit: number; rateLimitPerMinute: number; concurrentLimit: number };
}

export const QUOTA_LIMITS: QuotaLimits = {
  free: { runsLimit: 100, rateLimitPerMinute: 10, concurrentLimit: 5 },
  pro: { runsLimit: 1000, rateLimitPerMinute: 60, concurrentLimit: 10 },
  business: { runsLimit: 10000, rateLimitPerMinute: 300, concurrentLimit: 50 },
  enterprise: { runsLimit: 999999999, rateLimitPerMinute: 1000, concurrentLimit: 200 }
};

/**
 * Check if user has quota remaining
 */
export async function checkQuota(userId: string): Promise<QuotaStatus> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription) {
    // No subscription = free tier
    return {
      hasQuota: true,
      used: 0,
      limit: QUOTA_LIMITS.free.runsLimit,
      remaining: QUOTA_LIMITS.free.runsLimit,
      percentage: 0,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      plan: 'free'
    };
  }

  // Check if reset date has passed
  const now = new Date();
  if (now >= subscription.resetDate) {
    // Reset usage
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        runsUsed: 0,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1) // First of next month
      }
    });
    subscription.runsUsed = 0;
  }

  const limit = subscription.runsLimit;
  const used = subscription.runsUsed;
  const remaining = limit - used;
  const percentage = (used / limit) * 100;

  return {
    hasQuota: remaining > 0,
    used,
    limit,
    remaining,
    percentage,
    resetDate: subscription.resetDate,
    plan: subscription.plan
  };
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  userId: string,
  workflowId: string,
  executionId: string,
  duration: number = 0,
  success: boolean = true
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        runsUsed: { increment: 1 }
      }
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        subscriptionId: subscription.id,
        workflowId,
        executionId,
        duration,
        success
      }
    });
  }
}

/**
 * Get current usage stats
 */
export async function getUsage(userId: string): Promise<{
  current: QuotaStatus;
  history: any[];
  workflowBreakdown: any[];
}> {
  const current = await checkQuota(userId);
  
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      usageLogs: {
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      }
    }
  });

  // Get workflow breakdown
  const workflowBreakdown = subscription?.usageLogs
    ? Object.entries(
        subscription.usageLogs.reduce((acc, log) => {
          acc[log.workflowId] = (acc[log.workflowId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([workflowId, count]) => ({ workflowId, count }))
    : [];

  return {
    current,
    history: subscription?.usageLogs || [],
    workflowBreakdown
  };
}

/**
 * Get quota limit for plan
 */
export function getQuotaLimit(plan: string): number {
  return QUOTA_LIMITS[plan as keyof QuotaLimits]?.runsLimit || QUOTA_LIMITS.free.runsLimit;
}

/**
 * Check if quota exceeded
 */
export async function isQuotaExceeded(userId: string): Promise<boolean> {
  const status = await checkQuota(userId);
  return !status.hasQuota;
}

/**
 * Get rate limit for user
 */
export async function getRateLimit(userId: string): Promise<{
  perMinute: number;
  perHour: number;
  perDay: number;
  concurrent: number;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  if (!subscription) {
    return {
      perMinute: QUOTA_LIMITS.free.rateLimitPerMinute,
      perHour: QUOTA_LIMITS.free.rateLimitPerMinute * 60,
      perDay: QUOTA_LIMITS.free.rateLimitPerMinute * 60 * 24,
      concurrent: QUOTA_LIMITS.free.concurrentLimit
    };
  }

  return {
    perMinute: subscription.rateLimitPerMinute,
    perHour: subscription.rateLimitPerHour,
    perDay: subscription.rateLimitPerDay,
    concurrent: subscription.concurrentLimit
  };
}
