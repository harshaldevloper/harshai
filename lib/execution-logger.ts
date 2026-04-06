/**
 * Execution Logger - Day 38
 * Log workflow execution events with filtering
 */

import { prisma } from './prisma';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  executionId: string;
  workflowId: string;
  nodeId?: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  error?: string;
  duration?: number;
}

export interface LogFilter {
  executionId?: string;
  workflowId?: string;
  level?: LogLevel;
  nodeId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Create a log entry
 */
export async function log(entry: LogEntry): Promise<void> {
  await prisma.executionLog.create({
    data: {
      executionId: entry.executionId,
      workflowId: entry.workflowId,
      nodeId: entry.nodeId,
      level: entry.level,
      message: entry.message,
      data: entry.data ? JSON.stringify(entry.data) : null,
      error: entry.error,
      duration: entry.duration,
    },
  });
}

/**
 * Log debug message
 */
export async function debug(
  executionId: string,
  workflowId: string,
  message: string,
  data?: Record<string, any>,
  nodeId?: string
): Promise<void> {
  await log({ executionId, workflowId, nodeId, level: 'debug', message, data });
}

/**
 * Log info message
 */
export async function info(
  executionId: string,
  workflowId: string,
  message: string,
  data?: Record<string, any>,
  nodeId?: string
): Promise<void> {
  await log({ executionId, workflowId, nodeId, level: 'info', message, data });
}

/**
 * Log warning message
 */
export async function warn(
  executionId: string,
  workflowId: string,
  message: string,
  data?: Record<string, any>,
  nodeId?: string
): Promise<void> {
  await log({ executionId, workflowId, nodeId, level: 'warn', message, data });
}

/**
 * Log error message
 */
export async function error(
  executionId: string,
  workflowId: string,
  message: string,
  error: string,
  nodeId?: string,
  duration?: number
): Promise<void> {
  await log({ executionId, workflowId, nodeId, level: 'error', message, error, duration });
}

/**
 * Get logs with filters
 */
export async function getLogs(filter: LogFilter): Promise<{
  logs: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const {
    executionId,
    workflowId,
    level,
    nodeId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50,
  } = filter;

  const where: any = {};

  if (executionId) where.executionId = executionId;
  if (workflowId) where.workflowId = workflowId;
  if (level) where.level = level;
  if (nodeId) where.nodeId = nodeId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (search) {
    where.message = { contains: search, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.executionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.executionLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Clear logs older than specified days
 */
export async function clearLogs(olderThanDays: number): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.executionLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

/**
 * Get logs for specific execution
 */
export async function getExecutionLogs(executionId: string): Promise<any[]> {
  return prisma.executionLog.findMany({
    where: { executionId },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get error logs for workflow
 */
export async function getErrorLogs(
  workflowId: string,
  hours: number = 24
): Promise<any[]> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  return prisma.executionLog.findMany({
    where: {
      workflowId,
      level: 'error',
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  });
}
