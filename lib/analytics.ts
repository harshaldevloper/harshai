// HarshAI - Analytics Helper Functions
// Day 30: Analytics Dashboard

import { prisma } from './prisma';

export interface AnalyticsSummary {
  totalWorkflows: number;
  totalExecutions: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  successRate: number;
  avgExecutionTime: number;
  mostActiveWorkflow: {
    id: string;
    name: string;
    count: number;
  } | null;
  failedExecutions: number;
}

export interface ExecutionTrend {
  date: string;
  count: number;
  successCount: number;
  failedCount: number;
}

export interface TopWorkflow {
  id: string;
  name: string;
  executionCount: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface RecentExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  duration: number | null;
  error?: string;
}

// Get start of day in UTC
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get start of week (Monday) in UTC
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get start of month in UTC
function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get overall analytics summary for a user
export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  const now = new Date();
  const today = getStartOfDay(now);
  const thisWeek = getStartOfWeek(now);
  const thisMonth = getStartOfMonth(now);

  // Count workflows
  const totalWorkflows = await prisma.workflow.count({
    where: { userId }
  });

  // Count executions
  const totalExecutions = await prisma.execution.count({
    where: { userId }
  });

  const executionsToday = await prisma.execution.count({
    where: {
      userId,
      startedAt: {
        gte: today
      }
    }
  });

  const executionsThisWeek = await prisma.execution.count({
    where: {
      userId,
      startedAt: {
        gte: thisWeek
      }
    }
  });

  const executionsThisMonth = await prisma.execution.count({
    where: {
      userId,
      startedAt: {
        gte: thisMonth
      }
    }
  });

  // Get success/failed counts
  const successCount = await prisma.execution.count({
    where: {
      userId,
      status: 'completed'
    }
  });

  const failedCount = await prisma.execution.count({
    where: {
      userId,
      status: 'failed'
    }
  });

  // Calculate success rate
  const successRate = totalExecutions > 0 
    ? (successCount / totalExecutions) * 100 
    : 0;

  // Calculate average execution time
  const executionsWithDuration = await prisma.execution.findMany({
    where: {
      userId,
      status: { in: ['completed', 'failed'] },
      completedAt: { not: null }
    },
    select: {
      startedAt: true,
      completedAt: true
    },
    take: 1000 // Limit for performance
  });

  let avgExecutionTime = 0;
  if (executionsWithDuration.length > 0) {
    const totalDuration = executionsWithDuration.reduce((acc, exec) => {
      if (exec.completedAt && exec.startedAt) {
        return acc + (exec.completedAt.getTime() - exec.startedAt.getTime());
      }
      return acc;
    }, 0);
    avgExecutionTime = totalDuration / executionsWithDuration.length;
  }

  // Get most active workflow
  const mostActiveWorkflow = await prisma.execution.groupBy({
    by: ['workflowId'],
    where: { userId },
    _count: {
      workflowId: true
    },
    orderBy: {
      _count: {
        workflowId: 'desc'
      }
    },
    take: 1
  });

  let mostActiveWorkflowInfo = null;
  if (mostActiveWorkflow.length > 0) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: mostActiveWorkflow[0].workflowId },
      select: { id: true, name: true }
    });
    if (workflow) {
      mostActiveWorkflowInfo = {
        id: workflow.id,
        name: workflow.name,
        count: mostActiveWorkflow[0]._count.workflowId
      };
    }
  }

  return {
    totalWorkflows,
    totalExecutions,
    executionsToday,
    executionsThisWeek,
    executionsThisMonth,
    successRate: Math.round(successRate * 100) / 100,
    avgExecutionTime: Math.round(avgExecutionTime),
    mostActiveWorkflow: mostActiveWorkflowInfo,
    failedExecutions: failedCount
  };
}

// Get execution trends for the last 7 days
export async function getExecutionTrends(userId: string, days: number = 7): Promise<ExecutionTrend[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Get all executions in the date range
  const executions = await prisma.execution.findMany({
    where: {
      userId,
      startedAt: {
        gte: startDate
      }
    },
    select: {
      startedAt: true,
      status: true
    },
    orderBy: {
      startedAt: 'asc'
    }
  });

  // Group by date
  const trendsMap = new Map<string, { count: number; successCount: number; failedCount: number }>();
  
  // Initialize all dates in range
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    trendsMap.set(dateStr, { count: 0, successCount: 0, failedCount: 0 });
  }

  // Populate with actual data
  executions.forEach(exec => {
    const dateStr = exec.startedAt.toISOString().split('T')[0];
    const existing = trendsMap.get(dateStr) || { count: 0, successCount: 0, failedCount: 0 };
    
    existing.count++;
    if (exec.status === 'completed') {
      existing.successCount++;
    } else if (exec.status === 'failed') {
      existing.failedCount++;
    }
    
    trendsMap.set(dateStr, existing);
  });

  // Convert to array
  const trends: ExecutionTrend[] = Array.from(trendsMap.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    successCount: data.successCount,
    failedCount: data.failedCount
  }));

  return trends;
}

// Get top workflows by execution count
export async function getTopWorkflows(userId: string, limit: number = 5): Promise<TopWorkflow[]> {
  const workflowExecutions = await prisma.execution.groupBy({
    by: ['workflowId'],
    where: { userId },
    _count: {
      workflowId: true
    },
    orderBy: {
      _count: {
        workflowId: 'desc'
      }
    },
    take: limit
  });

  const topWorkflows: TopWorkflow[] = [];

  for (const wfExec of workflowExecutions) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: wfExec.workflowId },
      select: { id: true, name: true }
    });

    if (!workflow) continue;

    // Get success count for this workflow
    const successCount = await prisma.execution.count({
      where: {
        workflowId: wfExec.workflowId,
        status: 'completed'
      }
    });

    // Get average execution time for this workflow
    const executionsWithDuration = await prisma.execution.findMany({
      where: {
        workflowId: wfExec.workflowId,
        status: { in: ['completed', 'failed'] },
        completedAt: { not: null }
      },
      select: {
        startedAt: true,
        completedAt: true
      },
      take: 100
    });

    let avgExecutionTime = 0;
    if (executionsWithDuration.length > 0) {
      const totalDuration = executionsWithDuration.reduce((acc, exec) => {
        if (exec.completedAt && exec.startedAt) {
          return acc + (exec.completedAt.getTime() - exec.startedAt.getTime());
        }
        return acc;
      }, 0);
      avgExecutionTime = totalDuration / executionsWithDuration.length;
    }

    const successRate = wfExec._count.workflowId > 0
      ? (successCount / wfExec._count.workflowId) * 100
      : 0;

    topWorkflows.push({
      id: workflow.id,
      name: workflow.name,
      executionCount: wfExec._count.workflowId,
      successRate: Math.round(successRate * 100) / 100,
      avgExecutionTime: Math.round(avgExecutionTime)
    });
  }

  return topWorkflows;
}

// Get recent executions with workflow info
export async function getRecentExecutions(userId: string, limit: number = 10): Promise<RecentExecution[]> {
  const executions = await prisma.execution.findMany({
    where: { userId },
    include: {
      workflow: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    },
    take: limit
  });

  return executions.map(exec => ({
    id: exec.id,
    workflowId: exec.workflowId,
    workflowName: exec.workflow?.name || 'Unknown',
    status: exec.status,
    startedAt: exec.startedAt.toISOString(),
    duration: exec.completedAt && exec.startedAt
      ? exec.completedAt.getTime() - exec.startedAt.getTime()
      : null,
    error: exec.error || undefined
  }));
}

// Get execution history with filters
export async function getExecutionsWithFilters(
  userId: string,
  options: {
    workflowId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}
) {
  const {
    workflowId,
    status,
    startDate,
    endDate,
    page = 1,
    limit = 20
  } = options;

  const where: any = { userId };

  if (workflowId) {
    where.workflowId = workflowId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) where.startedAt.gte = startDate;
    if (endDate) where.startedAt.lte = endDate;
  }

  // Get total count
  const total = await prisma.execution.count({ where });

  // Get executions with pagination
  const executions = await prisma.execution.findMany({
    where,
    include: {
      workflow: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      startedAt: 'desc'
    },
    skip: (page - 1) * limit,
    take: limit
  });

  // Calculate duration for each execution
  const executionsWithDuration = executions.map(exec => ({
    ...exec,
    duration: exec.completedAt && exec.startedAt
      ? exec.completedAt.getTime() - exec.startedAt.getTime()
      : null
  }));

  return {
    executions: executionsWithDuration,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

// Get per-workflow stats
export async function getWorkflowStats(workflowId: string, userId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId }
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const totalExecutions = await prisma.execution.count({
    where: { workflowId }
  });

  const successCount = await prisma.execution.count({
    where: { workflowId, status: 'completed' }
  });

  const failedCount = await prisma.execution.count({
    where: { workflowId, status: 'failed' }
  });

  // Get average execution time
  const executionsWithDuration = await prisma.execution.findMany({
    where: {
      workflowId,
      status: { in: ['completed', 'failed'] },
      completedAt: { not: null }
    },
    select: {
      startedAt: true,
      completedAt: true
    },
    take: 100
  });

  let avgExecutionTime = 0;
  if (executionsWithDuration.length > 0) {
    const totalDuration = executionsWithDuration.reduce((acc, exec) => {
      if (exec.completedAt && exec.startedAt) {
        return acc + (exec.completedAt.getTime() - exec.startedAt.getTime());
      }
      return acc;
    }, 0);
    avgExecutionTime = totalDuration / executionsWithDuration.length;
  }

  // Get last execution
  const lastExecution = await prisma.execution.findFirst({
    where: { workflowId },
    orderBy: { startedAt: 'desc' }
  });

  return {
    workflow: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description
    },
    stats: {
      totalExecutions,
      successCount,
      failedCount,
      successRate: totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 100 * 100) / 100 : 0,
      avgExecutionTime: Math.round(avgExecutionTime),
      lastExecutedAt: lastExecution?.startedAt.toISOString() || null
    }
  };
}
