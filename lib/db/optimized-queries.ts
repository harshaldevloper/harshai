import { prisma } from './client';

/**
 * Optimized Database Queries
 * 
 * Performance-optimized queries to prevent N+1 problems,
 * reduce database load, and improve response times.
 */

export class OptimizedQueries {
  /**
   * Get user workflows with execution stats (optimized)
   * Uses single query with include instead of N+1
   */
  static async getUserWorkflowsWithStats(userId: string, limit = 20) {
    return prisma.workflow.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        executions: {
          take: 5,
          orderBy: { startedAt: 'desc' },
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            duration: true,
          },
        },
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get execution analytics with raw SQL for better performance
   */
  static async getExecutionAnalytics(workflowId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [stats, recentExecutions] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
        FROM "Execution"
        WHERE "workflowId" = ${workflowId}
          AND "startedAt" >= ${startDate}
        GROUP BY status
      `,
      prisma.execution.findMany({
        where: {
          workflowId,
          startedAt: { gte: startDate },
        },
        take: 100,
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          duration: true,
          error: true,
        },
      }),
    ]);

    return { stats, recentExecutions };
  }

  /**
   * Batch update execution statuses efficiently
   * Uses transaction for atomicity
   */
  static async batchUpdateExecutions(
    executionIds: string[],
    data: { status: string; completedAt?: Date; error?: string }
  ) {
    return prisma.$transaction(
      executionIds.map(id =>
        prisma.execution.update({
          where: { id },
          data,
        })
      )
    );
  }

  /**
   * Get user with workflows and execution counts (optimized)
   */
  static async getUserWithStats(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        workflows: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            workflows: true,
            executions: true,
          },
        },
      },
    });
  }

  /**
   * Search workflows with pagination (optimized)
   */
  static async searchWorkflows(
    userId: string,
    query: string,
    page = 1,
    pageSize = 20
  ) {
    const skip = (page - 1) * pageSize;
    
    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.workflow.count({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      workflows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get workflow executions with filters (optimized)
   */
  static async getWorkflowExecutions(
    workflowId: string,
    filters: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page = 1,
    pageSize = 50
  ) {
    const skip = (page - 1) * pageSize;
    
    const where: any = { workflowId };
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.startDate) {
      where.startedAt = { gte: filters.startDate };
    }
    
    if (filters.endDate) {
      where.startedAt = { ...where.startedAt, lte: filters.endDate };
    }

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        select: {
          id: true,
          status: true,
          startedAt: true,
          completedAt: true,
          duration: true,
          error: true,
          triggerType: true,
        },
        orderBy: { startedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.execution.count({ where }),
    ]);

    return {
      executions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Upsert workflow (create or update)
   * Prevents duplicate workflows
   */
  static async upsertWorkflow(
    uniqueKey: { userId: string; name: string },
    data: any
  ) {
    return prisma.workflow.upsert({
      where: {
        userId_name: uniqueKey,
      },
      update: data,
      create: {
        ...data,
        ...uniqueKey,
      },
    });
  }

  /**
   * Delete workflow and related data (cascading)
   */
  static async deleteWorkflow(workflowId: string) {
    return prisma.$transaction([
      prisma.webhookLog.deleteMany({
        where: { workflowId },
      }),
      prisma.webhookDelivery.deleteMany({
        where: { workflowId },
      }),
      prisma.execution.deleteMany({
        where: { workflowId },
      }),
      prisma.workflow.delete({
        where: { id: workflowId },
      }),
    ]);
  }

  /**
   * Get dashboard statistics (optimized)
   */
  static async getDashboardStats(userId: string) {
    const [
      workflowCount,
      executionStats,
      recentExecutions,
    ] = await Promise.all([
      prisma.workflow.count({
        where: { userId },
      }),
      prisma.$queryRaw`
        SELECT 
          status,
          COUNT(*) as count
        FROM "Execution" e
        JOIN "Workflow" w ON e."workflowId" = w.id
        WHERE w."userId" = ${userId}
          AND e."startedAt" >= NOW() - INTERVAL '30 days'
        GROUP BY status
      `,
      prisma.execution.findMany({
        where: {
          workflow: { userId },
          startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: {
          id: true,
          status: true,
          startedAt: true,
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      workflowCount,
      executionStats: executionStats as any[],
      recentExecutions,
    };
  }
}
