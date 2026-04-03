import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/execution-engine';
import { getTemplateById } from '@/lib/templates';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/[workflowId] - Webhook trigger for workflows
 * 
 * Accepts POST requests and triggers workflow execution
 * Request body is passed as initial data to the workflow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { workflowId } = params;
    
    // Parse incoming webhook payload
    const payload = await request.json();
    
    console.log(`[Webhook] Received for workflow: ${workflowId}`);
    console.log(`[Webhook] Payload:`, JSON.stringify(payload, null, 2));

    // Get workflow definition
    let workflowNodes, workflowEdges, workflowName;

    // Try to load from templates first
    const template = getTemplateById(workflowId);
    if (template) {
      workflowNodes = template.nodes;
      workflowEdges = template.edges;
      workflowName = template.name;
    } else {
      // Try to load from database (custom workflows)
      // TODO: Implement custom workflow loading
      return NextResponse.json(
        { error: `Workflow "${workflowId}" not found` },
        { status: 404 }
      );
    }

    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        userId: 'webhook-user', // TODO: Get from auth
        status: 'running',
        result: { status: 'started', webhookPayload: payload },
        triggeredBy: 'webhook',
      },
    });

    console.log(`[Webhook] Execution ID: ${execution.id}`);

    // Execute the workflow
    const result = await executeWorkflow(
      workflowId,
      workflowName,
      workflowNodes,
      workflowEdges,
      payload // Pass webhook payload as initial data
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

    console.log(`[Webhook] Execution ${execution.id} completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);

    // Return result
    return NextResponse.json({
      success: result.success,
      executionId: execution.id,
      output: result.output,
      executionTime: result.executionTime,
      stepsExecuted: result.stepsExecuted,
      error: result.error,
    });
  } catch (error) {
    console.error('[Webhook] Execution failed:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Webhook execution failed',
        success: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/webhooks/[workflowId] - Get webhook info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const { workflowId } = params;
  
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-workflow-automator.vercel.app'}/api/webhooks/${workflowId}`;

  return NextResponse.json({
    workflowId,
    webhookUrl,
    method: 'POST',
    contentType: 'application/json',
    example: {
      title: 'Example Blog Post',
      url: 'https://yourblog.com/post',
      imageUrl: 'https://yourblog.com/image.jpg',
    },
  });
}
