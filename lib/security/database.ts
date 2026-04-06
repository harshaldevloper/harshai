import { prisma } from '../db/client';

/**
 * Secure Database Operations
 * 
 * Best practices for preventing SQL injection and other database attacks.
 * All queries use parameterized statements through Prisma ORM.
 */

export class SecureDatabase {
  /**
   * Safe user lookup by email
   * Uses parameterized query (Prisma handles parameterization)
   */
  static async findUserByEmail(email: string) {
    // ✅ SAFE: Prisma automatically parameterizes this query
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  /**
   * Safe user lookup by ID
   * Validates UUID format before query
   */
  static async findUserById(userId: string) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return null;
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  }

  /**
   * Safe search with parameterized LIKE
   * Prevents SQL injection in search functionality
   */
  static async searchWorkflows(userId: string, searchTerm: string) {
    // Sanitize search term
    const sanitizedTerm = searchTerm.trim().substring(0, 100);

    return prisma.workflow.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: sanitizedTerm, mode: 'insensitive' } },
          { description: { contains: sanitizedTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      take: 50,
    });
  }

  /**
   * Safe execution stats with raw SQL
   * Uses Prisma's parameterized raw queries
   */
  static async getExecutionStats(workflowId: string, days: number) {
    // Validate inputs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workflowId)) {
      throw new Error('Invalid workflow ID');
    }

    if (days < 1 || days > 365) {
      throw new Error('Days must be between 1 and 365');
    }

    // ✅ SAFE: Using template literals with Prisma's SQL tagging
    return prisma.$queryRaw`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
      FROM "Execution"
      WHERE "workflowId" = ${workflowId}
        AND "startedAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY status
    `;
  }

  /**
   * Validate table name against whitelist
   * Prevents SQL injection in dynamic table queries
   */
  static async getTableCount(tableName: string) {
    const allowedTables = ['User', 'Workflow', 'Execution', 'WebhookLog', 'WebhookDelivery'];
    
    if (!allowedTables.includes(tableName)) {
      throw new Error('Invalid table name');
    }
    
    // ✅ SAFE: Table name validated against whitelist
    const result = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM "${tableName}"`
    );
    
    return (result as any[])[0]?.count ?? 0;
  }

  /**
   * Safe batch insert with transaction
   * Ensures atomicity and prevents partial writes
   */
  static async batchInsertExecutions(executions: any[]) {
    // Validate and sanitize each execution
    const sanitizedExecutions = executions.map(exec => ({
      workflowId: exec.workflowId,
      status: exec.status || 'pending',
      inputData: exec.inputData || {},
      startedAt: new Date(),
    }));

    return prisma.$transaction(
      sanitizedExecutions.map(data =>
        prisma.execution.create({
          data,
        })
      )
    );
  }

  /**
   * Safe update with optimistic locking
   * Prevents race conditions and ensures data integrity
   */
  static async updateWorkflowWithLock(
    workflowId: string,
    data: any,
    expectedVersion: number
  ) {
    try {
      const result = await prisma.workflow.update({
        where: {
          id: workflowId,
          version: expectedVersion,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });

      return { success: true, workflow: result };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Workflow was modified by another user' };
      }
      throw error;
    }
  }

  /**
   * Safe delete with cascade
   * Ensures related data is properly cleaned up
   */
  static async deleteWorkflowWithCascade(workflowId: string) {
    return prisma.$transaction([
      // Delete related webhook logs
      prisma.webhookLog.deleteMany({
        where: { workflowId },
      }),
      // Delete related webhook deliveries
      prisma.webhookDelivery.deleteMany({
        where: { workflowId },
      }),
      // Delete related executions
      prisma.execution.deleteMany({
        where: { workflowId },
      }),
      // Delete the workflow
      prisma.workflow.delete({
        where: { id: workflowId },
      }),
    ]);
  }

  /**
   * Safe count with filters
   * Prevents injection in filter parameters
   */
  static async countWorkflows(userId: string, filters: any = {}) {
    const where: any = { userId };

    // Safely add filters
    if (filters.status && typeof filters.status === 'string') {
      where.status = filters.status;
    }

    if (filters.search && typeof filters.search === 'string') {
      where.OR = [
        { name: { contains: filters.search.substring(0, 100), mode: 'insensitive' } },
        { description: { contains: filters.search.substring(0, 100), mode: 'insensitive' } },
      ];
    }

    return prisma.workflow.count({ where });
  }

  /**
   * Safe pagination
   * Prevents offset-based attacks
   */
  static async getPaginatedWorkflows(
    userId: string,
    page: number,
    pageSize: number
  ) {
    // Validate pagination parameters
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const skip = (safePage - 1) * safePageSize;

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safePageSize,
      }),
      prisma.workflow.count({ where: { userId } }),
    ]);

    return {
      workflows,
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.ceil(total / safePageSize),
      },
    };
  }
}
