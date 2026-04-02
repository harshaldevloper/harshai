import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/execution-engine';
import { getTemplateById } from '@/lib/templates';
import { PrismaClient } from '@prisma/client';

/**
 * POST /api/execute - Execute a workflow
 * 
 * Request body:
 * - workflowId: string (template ID or custom workflow ID)
 * - nodes: array (optional, for custom workflows)
 * - edges: array (optional, for custom workflows)
 * - data: object (initial data for the workflow)
 */
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const body = await request.json();
    const { workflowId, nodes, edges, data = {} } = body;

    if (!workflowId && (!nodes || !edges)) {
      return NextResponse.json(
        { error: 'Either workflowId or nodes/edges must be provided' },
        { status: 400 }
      );
    }

    // Get workflow definition
    let workflowNodes, workflowEdges, workflowName;

    if (workflowId) {
      // Try to load from templates
      const template = getTemplateById(workflowId);
      if (template) {
        workflowNodes = template.nodes;
        workflowEdges = template.edges;
        workflowName = template.name;
      } else {
        // Try to load from database (future implementation)
        return NextResponse.json(
          { error: `Workflow template "${workflowId}" not found` },
          { status: 404 }
        );
      }
    } else {
      // Use provided nodes/edges
      workflowNodes = nodes;
      workflowEdges = edges;
      workflowName = 'Custom Workflow';
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflowId || 'custom',
        userId: 'demo-user', // TODO: Get from auth
        status: 'running',
        result: { status: 'started' },
      },
    });

    console.log(`[API] Execution ID: ${execution.id}, Workflow: ${workflowName}`);

    // Execute the workflow
    const result = await executeWorkflow(
      workflowId || 'custom',
      workflowName,
      workflowNodes,
      workflowEdges,
      data
    );

    // Update execution record
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? 'completed' : 'failed',
        result: result.output,
        error: result.error,
        completedAt: new Date(),
      },
    });

    console.log(`[API] Execution ${execution.id} completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`[API] Execution time: ${result.executionTime}ms`);
    console.log(`[API] Steps executed: ${result.stepsExecuted}`);

    // Return result
    return NextResponse.json({
      success: result.success,
      output: result.output,
      executionTime: result.executionTime,
      stepsExecuted: result.stepsExecuted,
      error: result.error,
      executionId: execution.id,
    });
  } catch (error) {
    console.error('[API] Workflow execution failed:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Workflow execution failed',
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/execute - Get execution history
 * Query params: workflowId, status, limit
 */
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (workflowId) where.workflowId = workflowId;
    if (status) where.status = status;

    const executions = await prisma.execution.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      executions: executions.map(e => ({
        id: e.id,
        workflowId: e.workflowId,
        workflowName: e.workflow.name,
        status: e.status,
        result: e.result,
        error: e.error,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
      })),
      total: executions.length,
    });
  } catch (error) {
    console.error('[API] Failed to fetch executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution history' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
