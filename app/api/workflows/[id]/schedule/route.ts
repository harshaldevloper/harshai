// HarshAI - Schedule Management API
// Day 26: Scheduled Workflows (Cron Triggers)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getNextRun } from '@/lib/scheduler';

const prisma = new PrismaClient();

// POST /api/workflows/[id]/schedule - Set schedule for workflow
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cronExpression, triggerType } = await request.json();
    const workflowId = params.id;

    // Validate cron expression (basic check)
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) {
      return NextResponse.json(
        { error: 'Invalid cron expression format. Expected: minute hour day month dayOfWeek' },
        { status: 400 }
      );
    }

    // Get workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Update workflow
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        triggerType: 'cron',
        cronExpression,
        scheduleEnabled: true,
        nextExecutedAt: getNextRun(cronExpression)
      }
    });

    // Create or update schedule record
    await prisma.schedule.upsert({
      where: { workflowId },
      create: {
        workflowId,
        cronExpression,
        isEnabled: true,
        nextRun: getNextRun(cronExpression)
      },
      update: {
        cronExpression,
        isEnabled: true,
        nextRun: getNextRun(cronExpression)
      }
    });

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
      nextRun: getNextRun(cronExpression)
    });

  } catch (error) {
    console.error('Error setting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to set schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id]/schedule - Remove schedule from workflow
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    // Update workflow
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        triggerType: 'manual',
        cronExpression: null,
        scheduleEnabled: false,
        nextExecutedAt: null
      }
    });

    // Delete schedule record
    await prisma.schedule.deleteMany({
      where: { workflowId }
    });

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow
    });

  } catch (error) {
    console.error('Error removing schedule:', error);
    return NextResponse.json(
      { error: 'Failed to remove schedule' },
      { status: 500 }
    );
  }
}

// GET /api/workflows/[id]/schedule - Get schedule info for workflow
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    // Get workflow with schedule
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        schedule: true
      }
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workflow: {
        id: workflow.id,
        name: workflow.name,
        triggerType: workflow.triggerType,
        cronExpression: workflow.cronExpression,
        scheduleEnabled: workflow.scheduleEnabled,
        nextExecutedAt: workflow.nextExecutedAt,
        lastExecutedAt: workflow.lastExecutedAt
      },
      schedule: workflow.schedule
    });

  } catch (error) {
    console.error('Error getting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to get schedule' },
      { status: 500 }
    );
  }
}
