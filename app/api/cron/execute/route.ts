// HarshAI - Cron Execute API Endpoint
// Day 28: Background Scheduler (Cron-based Workflow Execution)
// This endpoint is called by Vercel Cron Jobs to execute scheduled workflows

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getNextRun } from '@/lib/scheduler';

const prisma = new PrismaClient();

/**
 * POST /api/cron/execute - Execute all due scheduled workflows
 * Called by Vercel Cron Job every minute
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional security measure)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    console.log(`[Cron] Checking scheduled workflows at ${now.toISOString()}`);

    // Get all active workflows with cron schedules that are due
    const workflows = await prisma.workflow.findMany({
      where: {
        triggerType: 'cron',
        scheduleEnabled: true,
        nextExecutedAt: {
          lte: now
        }
      },
      include: {
        schedule: true,
        user: true
      }
    });

    console.log(`[Cron] Found ${workflows.length} workflows to execute`);

    const results: Array<{
      workflowId: string;
      workflowName: string;
      status: string;
      executionId?: string;
      error?: string;
    }> = [];

    for (const workflow of workflows) {
      try {
        console.log(`[Cron] Executing workflow: ${workflow.name} (${workflow.id})`);

        // Create execution record
        const execution = await prisma.execution.create({
          data: {
            workflowId: workflow.id,
            userId: workflow.userId,
            status: 'running',
            startedAt: new Date()
          }
        });

        // Create scheduled execution record
        if (workflow.schedule) {
          await prisma.scheduledExecution.create({
            data: {
              scheduleId: workflow.schedule.id,
              status: 'running',
              startedAt: new Date()
            }
          });
        }

        // Execute the workflow and send notifications
        const executionResult = await executeWorkflowWithNotifications(
          workflow,
          execution.id,
          workflow.user.id
        );

        // Update execution record
        await prisma.execution.update({
          where: { id: execution.id },
          data: {
            status: executionResult.success ? 'completed' : 'failed',
            result: executionResult.output ?? undefined,
            error: executionResult.error ?? undefined,
            completedAt: new Date()
          }
        });

        // Update workflow stats
        const nextRun = workflow.cronExpression ? getNextRun(workflow.cronExpression) : null;
        await prisma.workflow.update({
          where: { id: workflow.id },
          data: {
            runs: { increment: 1 },
            lastExecutedAt: new Date(),
            nextExecutedAt: nextRun
          }
        });

        // Update schedule
        if (workflow.schedule) {
          await prisma.schedule.update({
            where: { workflowId: workflow.id },
            data: {
              lastRun: new Date(),
              nextRun: nextRun
            }
          });

          // Update scheduled execution
          await prisma.scheduledExecution.updateMany({
            where: {
              scheduleId: workflow.schedule.id,
              status: 'running'
            },
            data: {
              status: executionResult.success ? 'completed' : 'failed',
              result: executionResult.output ?? undefined,
              error: executionResult.error ?? undefined,
              completedAt: new Date()
            }
          });
        }

        console.log(`[Cron] Workflow ${workflow.name} executed successfully`);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: executionResult.success ? 'success' : 'failed',
          executionId: execution.id
        });

      } catch (error) {
        console.error(`[Cron] Error executing workflow ${workflow.id}:`, error);
        results.push({
          workflowId: workflow.id,
          workflowName: workflow.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Update workflow to prevent continuous failed executions
        await prisma.workflow.update({
          where: { id: workflow.id },
          data: {
            scheduleEnabled: false,
            nextExecutedAt: null
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      executedAt: now.toISOString(),
      workflowsExecuted: workflows.length,
      results
    });

  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return NextResponse.json(
      { error: 'Cron execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/cron/execute - Get cron execution status
 */
export async function GET() {
  try {
    const now = new Date();
    
    // Get statistics
    const activeSchedules = await prisma.schedule.count({
      where: { isEnabled: true }
    });

    const dueWorkflows = await prisma.workflow.count({
      where: {
        triggerType: 'cron',
        scheduleEnabled: true,
        nextExecutedAt: {
          lte: now
        }
      }
    });

    const recentExecutions = await prisma.scheduledExecution.findMany({
      take: 10,
      orderBy: { startedAt: 'desc' },
      include: {
        schedule: {
          include: {
            workflow: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      status: 'ok',
      currentTime: now.toISOString(),
      activeSchedules,
      dueWorkflows,
      recentExecutions: recentExecutions.map((e: any) => ({
        id: e.id,
        workflowName: e.schedule.workflow.name,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt
      }))
    });

  } catch (error) {
    console.error('[Cron] Status check failed:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Execute a single workflow
 * This is a simplified version - in production, use the full execution engine
 */
async function executeWorkflow(workflow: any) {
  try {
    // Parse workflow nodes and edges
    const nodes = typeof workflow.nodes === 'string' 
      ? JSON.parse(workflow.nodes) 
      : workflow.nodes;
    
    const edges = typeof workflow.edges === 'string'
      ? JSON.parse(workflow.edges)
      : workflow.edges;

    // TODO: Integrate with the actual execution engine
    // For now, simulate execution
    console.log(`[Execute] Processing ${nodes?.length || 0} nodes`);

    // Simulate workflow execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      output: {
        status: 'completed',
        nodesExecuted: nodes?.length || 0,
        message: `Scheduled workflow "${workflow.name}" executed successfully`
      },
      error: null
    };

  } catch (error) {
    return {
      success: false,
      output: null,
      error: error instanceof Error ? error.message : 'Unknown execution error'
    };
  }
}

/**
 * Execute workflow with notification support
 */
async function executeWorkflowWithNotifications(
  workflow: any,
  executionId: string,
  userId: string
) {
  const startTime = Date.now();
  
  try {
    // Parse workflow nodes and edges
    const nodes = typeof workflow.nodes === 'string' 
      ? JSON.parse(workflow.nodes) 
      : workflow.nodes;
    
    const edges = typeof workflow.edges === 'string'
      ? JSON.parse(workflow.edges)
      : workflow.edges;

    console.log(`[Execute] Processing ${nodes?.length || 0} nodes`);

    // Simulate workflow execution (replace with actual execution engine in production)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const executionTime = Date.now() - startTime;
    const result = {
      success: true,
      output: {
        status: 'completed',
        nodesExecuted: nodes?.length || 0,
        message: `Scheduled workflow "${workflow.name}" executed successfully`
      },
      error: null,
      executionTime,
      stepsExecuted: nodes?.length || 0
    };

    // Send success notification
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const apiSecret = process.env.CRON_SECRET || process.env.API_SECRET;
      
      await fetch(`${apiUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiSecret ? `Bearer ${apiSecret}` : ''
        },
        body: JSON.stringify({
          executionId,
          workflowId: workflow.id,
          workflowName: workflow.name,
          userId,
          type: 'success',
          executionTime: result.executionTime,
          stepsExecuted: result.stepsExecuted
        })
      });
      console.log(`[Notifications] Success notification sent for workflow ${workflow.name}`);
    } catch (notifError) {
      console.error('[Notifications] Failed to send success notification:', notifError);
    }

    return result;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
    
    // Send failure notification
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const apiSecret = process.env.CRON_SECRET || process.env.API_SECRET;
      
      await fetch(`${apiUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiSecret ? `Bearer ${apiSecret}` : ''
        },
        body: JSON.stringify({
          executionId,
          workflowId: workflow.id,
          workflowName: workflow.name,
          userId,
          type: 'failure',
          errorMessage,
          executionTime
        })
      });
      console.log(`[Notifications] Failure notification sent for workflow ${workflow.name}`);
    } catch (notifError) {
      console.error('[Notifications] Failed to send failure notification:', notifError);
    }

    return {
      success: false,
      output: null,
      error: errorMessage,
      executionTime
    };
  }
}
