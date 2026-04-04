// HarshAI - Cron Scheduler Service
// Day 26: Scheduled Workflows (Cron Triggers)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple cron parser for basic patterns
// Supports: * * * * * (minute hour day month dayOfWeek)
export function parseCronExpression(cronExpression: string): Date[] {
  const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');
  const dates: Date[] = [];
  const now = new Date();
  
  // Get next 24 hours of execution times
  for (let i = 1; i <= 24; i++) {
    const execTime = new Date(now.getTime() + i * 60 * 60 * 1000);
    
    const m = parseInt(minute);
    const h = parseInt(hour);
    const d = parseInt(day);
    const mo = parseInt(month);
    const dow = parseInt(dayOfWeek);
    
    if (execTime.getMinutes() === m &&
        execTime.getHours() === h &&
        execTime.getDate() === d &&
        execTime.getMonth() + 1 === mo &&
        execTime.getDay() === dow) {
      dates.push(execTime);
    }
  }
  
  return dates;
}

export function getNextRun(cronExpression: string): Date | null {
  const runs = parseCronExpression(cronExpression);
  return runs.length > 0 ? runs[0] : null;
}

// Check all scheduled workflows and execute if due
export async function checkScheduledWorkflows() {
  const now = new Date();
  
  // Get all active workflows with cron schedules
  const workflows = await prisma.workflow.findMany({
    where: {
      triggerType: 'cron',
      scheduleEnabled: true,
      nextExecutedAt: {
        lte: now
      }
    },
    include: {
      executions: {
        take: 1,
        orderBy: { startedAt: 'desc' }
      }
    }
  });
  
  for (const workflow of workflows) {
    try {
      // Check if it's been at least 1 minute since last run
      const lastExecution = workflow.executions[0];
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      
      if (!lastExecution || lastExecution.startedAt < oneMinuteAgo) {
        // Execute the workflow
        await executeScheduledWorkflow(workflow);
      }
    } catch (error) {
      console.error(`Error checking workflow ${workflow.id}:`, error);
    }
  }
}

async function executeScheduledWorkflow(workflow: any) {
  console.log(`Executing scheduled workflow: ${workflow.name}`);
  
  // Create execution record
  const execution = await prisma.execution.create({
    data: {
      workflowId: workflow.id,
      userId: workflow.userId,
      status: 'pending',
      startedAt: new Date()
    }
  });
  
  try {
    // TODO: Execute the workflow nodes
    // This will be implemented in the execution engine
    const result = await executeWorkflowNodes(workflow);
    
    // Update execution
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        result,
        completedAt: new Date()
      }
    });
    
    // Update workflow stats
    await prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        runs: { increment: 1 },
        lastExecutedAt: new Date(),
        nextExecutedAt: getNextRun(workflow.cronExpression!)
      }
    });
    
    console.log(`Workflow ${workflow.name} executed successfully`);
  } catch (error) {
    console.error(`Error executing workflow ${workflow.id}:`, error);
    
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    });
  }
}

async function executeWorkflowNodes(workflow: any) {
  // TODO: Implement actual workflow execution
  // This will parse the nodes and edges from the workflow
  // and execute them in order
  
  return {
    status: 'completed',
    nodesExecuted: workflow.nodes ? workflow.nodes.length : 0,
    message: 'Scheduled workflow executed'
  };
}

// Background scheduler - runs every minute
export function startScheduler() {
  console.log('Starting cron scheduler...');
  
  // Run immediately
  checkScheduledWorkflows();
  
  // Then run every minute
  setInterval(checkScheduledWorkflows, 60 * 1000);
}
