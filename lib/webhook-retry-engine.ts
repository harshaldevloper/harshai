import { PrismaClient } from '@prisma/client';
import { random } from './utils';

const prisma = new PrismaClient();

export type RetryStrategy = 'exponential' | 'linear' | 'fixed';

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  strategy: RetryStrategy;
  baseDelay: number; // seconds
}

export interface RetryResult {
  shouldRetry: boolean;
  nextRetryAt?: Date;
  delaySeconds?: number;
  reason?: string;
}

/**
 * Check if a status code is retryable
 */
export function isRetryableStatusCode(status: number): boolean {
  // Retry on server errors and rate limits
  const retryableCodes = [408, 429, 500, 502, 503, 504];
  return retryableCodes.includes(status);
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: string): boolean {
  const retryableErrors = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'timeout',
    'socket hang up',
  ];
  
  return retryableErrors.some(err => error.toLowerCase().includes(err.toLowerCase()));
}

/**
 * Calculate backoff delay based on strategy
 */
export function calculateBackoff(
  attempt: number,
  strategy: RetryStrategy = 'exponential',
  baseDelaySeconds: number = 60
): number {
  let delaySeconds: number;
  
  switch (strategy) {
    case 'exponential':
      // Exponential backoff: baseDelay * 2^(attempt-1)
      delaySeconds = baseDelaySeconds * Math.pow(2, attempt - 1);
      break;
    
    case 'linear':
      // Linear backoff: baseDelay * attempt
      delaySeconds = baseDelaySeconds * attempt;
      break;
    
    case 'fixed':
    default:
      // Fixed delay
      delaySeconds = baseDelaySeconds;
      break;
  }
  
  // Add jitter (±10%) to prevent thundering herd
  const jitter = delaySeconds * 0.1 * (Math.random() * 2 - 1);
  delaySeconds += jitter;
  
  // Cap at 1 hour (3600 seconds)
  return Math.min(delaySeconds, 3600);
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(
  attempt: number,
  strategy: RetryStrategy = 'exponential',
  baseDelaySeconds: number = 60
): number {
  const delaySeconds = calculateBackoff(attempt, strategy, baseDelaySeconds);
  return Math.floor(delaySeconds * 1000);
}

/**
 * Determine if webhook should be retried
 */
export function shouldRetry(
  retryCount: number,
  maxRetries: number,
  httpStatus?: number,
  error?: string
): { shouldRetry: boolean; reason?: string } {
  // Check if max retries reached
  if (retryCount >= maxRetries) {
    return {
      shouldRetry: false,
      reason: `Max retries (${maxRetries}) exceeded`,
    };
  }
  
  // Don't retry on client errors (4xx except 408, 429)
  if (httpStatus && httpStatus >= 400 && httpStatus < 500) {
    if (!isRetryableStatusCode(httpStatus)) {
      return {
        shouldRetry: false,
        reason: `Non-retryable HTTP status: ${httpStatus}`,
      };
    }
  }
  
  // Check if error is retryable
  if (error && !isRetryableError(error)) {
    // If we have an HTTP status, use that decision
    if (httpStatus) {
      return {
        shouldRetry: isRetryableStatusCode(httpStatus),
        reason: isRetryableStatusCode(httpStatus) ? undefined : `Non-retryable error: ${error}`,
      };
    }
    
    return {
      shouldRetry: false,
      reason: `Non-retryable error: ${error}`,
    };
  }
  
  return {
    shouldRetry: true,
  };
}

/**
 * Schedule a webhook for retry
 */
export async function scheduleRetry(
  webhookLogId: string,
  retryCount: number,
  strategy: RetryStrategy = 'exponential',
  baseDelaySeconds: number = 60
): Promise<RetryResult> {
  const nextAttempt = retryCount + 1;
  const delaySeconds = calculateBackoff(nextAttempt, strategy, baseDelaySeconds);
  const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
  
  // Update webhook log with retry info
  await prisma.webhookLog.update({
    where: { id: webhookLogId },
    data: {
      retryCount: nextAttempt,
      nextRetryAt,
      retryStrategy: strategy,
    },
  });
  
  // Create delivery record
  await prisma.webhookDelivery.create({
    data: {
      webhookLogId,
      attemptNumber: nextAttempt,
      status: 'pending',
    },
  });
  
  return {
    shouldRetry: true,
    nextRetryAt,
    delaySeconds: Math.floor(delaySeconds),
  };
}

/**
 * Mark webhook delivery as successful
 */
export async function markDeliverySuccess(
  webhookLogId: string,
  deliveryId: string,
  httpStatus: number,
  responseTime: number,
  responseBody?: any
): Promise<void> {
  await prisma.$transaction([
    // Update delivery record
    prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'delivered',
        httpStatus,
        responseTime,
        responseBody,
        deliveredAt: new Date(),
      },
    }),
    
    // Update webhook log
    prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: {
        status: 'completed',
        nextRetryAt: null,
      },
    }),
  ]);
}

/**
 * Mark webhook delivery as failed
 */
export async function markDeliveryFailed(
  webhookLogId: string,
  deliveryId: string,
  httpStatus: number | null,
  error: string,
  responseTime?: number
): Promise<RetryResult> {
  const webhookLog = await prisma.webhookLog.findUnique({
    where: { id: webhookLogId },
  });
  
  if (!webhookLog) {
    throw new Error(`Webhook log ${webhookLogId} not found`);
  }
  
  // Update delivery record
  await prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'failed',
      httpStatus: httpStatus ?? undefined,
      errorMessage: error,
      responseTime,
    },
  });
  
  // Check if we should retry
  const retryCheck = shouldRetry(
    webhookLog.retryCount,
    webhookLog.maxRetries,
    httpStatus ?? undefined,
    error
  );
  
  if (retryCheck.shouldRetry) {
    // Schedule next retry
    const retryResult = await scheduleRetry(
      webhookLogId,
      webhookLog.retryCount,
      (webhookLog.retryStrategy as RetryStrategy) || 'exponential',
      60 // base delay - would come from workflow config
    );
    
    return retryResult;
  } else {
    // Mark as permanently failed
    await prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: {
        status: 'failed',
        error,
        nextRetryAt: null,
      },
    });
    
    return {
      shouldRetry: false,
      reason: retryCheck.reason,
    };
  }
}

/**
 * Get webhooks due for retry
 */
export async function getWebhooksDueForRetry(limit: number = 50): Promise<any[]> {
  const now = new Date();
  
  const webhooks = await prisma.webhookLog.findMany({
    where: {
      status: { in: ['received', 'processing'] },
      nextRetryAt: {
        lte: now,
      },
      retryCount: {
        lt: prisma.webhookLog.fields.maxRetries,
      },
    },
    include: {
      workflow: {
        select: {
          id: true,
          userId: true,
          name: true,
          nodes: true,
          edges: true,
          webhookRetryEnabled: true,
          webhookRetryStrategy: true,
          webhookRetryBaseDelay: true,
        },
      },
    },
    orderBy: {
      nextRetryAt: 'asc',
    },
    take: limit,
  });
  
  return webhooks;
}

/**
 * Get delivery history for a webhook log
 */
export async function getDeliveryHistory(webhookLogId: string): Promise<any[]> {
  const deliveries = await prisma.webhookDelivery.findMany({
    where: { webhookLogId },
    orderBy: {
      attemptNumber: 'asc',
    },
  });
  
  return deliveries;
}

/**
 * Get retry statistics for a workflow
 */
export async function getRetryStats(workflowId: string): Promise<{
  totalWebhooks: number;
  deliveredOnFirstAttempt: number;
  deliveredAfterRetries: number;
  failedAfterAllRetries: number;
  averageRetryCount: number;
  successRate: number;
}> {
  const webhookLogs = await prisma.webhookLog.findMany({
    where: { workflowId },
    select: {
      retryCount: true,
      status: true,
    },
  });
  
  const total = webhookLogs.length;
  if (total === 0) {
    return {
      totalWebhooks: 0,
      deliveredOnFirstAttempt: 0,
      deliveredAfterRetries: 0,
      failedAfterAllRetries: 0,
      averageRetryCount: 0,
      successRate: 0,
    };
  }
  
  const deliveredOnFirst = webhookLogs.filter(log => log.status === 'completed' && log.retryCount === 0).length;
  const deliveredAfterRetry = webhookLogs.filter(log => log.status === 'completed' && log.retryCount > 0).length;
  const failed = webhookLogs.filter(log => log.status === 'failed').length;
  
  const totalRetries = webhookLogs.reduce((sum, log) => sum + log.retryCount, 0);
  const avgRetryCount = totalRetries / total;
  
  const successRate = ((deliveredOnFirst + deliveredAfterRetry) / total) * 100;
  
  return {
    totalWebhooks: total,
    deliveredOnFirstAttempt: deliveredOnFirst,
    deliveredAfterRetries: deliveredAfterRetry,
    failedAfterAllRetries: failed,
    averageRetryCount: parseFloat(avgRetryCount.toFixed(2)),
    successRate: parseFloat(successRate.toFixed(2)),
  };
}

/**
 * Manually retry a webhook
 */
export async function manualRetry(webhookLogId: string): Promise<{
  success: boolean;
  deliveryId?: string;
  error?: string;
}> {
  try {
    const webhookLog = await prisma.webhookLog.findUnique({
      where: { id: webhookLogId },
      include: {
        workflow: true,
      },
    });
    
    if (!webhookLog) {
      return {
        success: false,
        error: 'Webhook log not found',
      };
    }
    
    // Create new delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookLogId,
        attemptNumber: webhookLog.retryCount + 1,
        status: 'pending',
        requestBody: webhookLog.payload,
      },
    });
    
    // Reset retry count and clear nextRetryAt
    await prisma.webhookLog.update({
      where: { id: webhookLogId },
      data: {
        retryCount: 0,
        nextRetryAt: null,
        status: 'received',
      },
    });
    
    return {
      success: true,
      deliveryId: delivery.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Manual retry failed',
    };
  }
}
