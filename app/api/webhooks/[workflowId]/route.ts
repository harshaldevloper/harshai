import { NextRequest, NextResponse } from 'next/server';
import { getWebhookInfo, toggleWebhookEnabled } from '@/lib/webhook-handler';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/webhooks/[workflowId]
 * 
 * Get webhook information for a workflow
 * - Requires authentication
 * - Returns webhook URL, enabled status, and logs count
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { workflowId } = params;
    
    // Verify workflow belongs to user
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
    });
    
    await prisma.$disconnect();
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Get webhook info
    const webhookInfo = await getWebhookInfo(workflowId);
    
    if (!webhookInfo) {
      return NextResponse.json({ error: 'Webhook info not found' }, { status: 404 });
    }
    
    return NextResponse.json(webhookInfo);
  } catch (error) {
    console.error('[Webhook Info] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/webhooks/[workflowId]
 * 
 * Toggle webhook enabled status
 * - Requires authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { workflowId } = params;
    const { enabled } = await request.json();
    
    // Verify workflow belongs to user
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
    });
    
    if (!workflow) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Toggle webhook
    await toggleWebhookEnabled(workflowId, enabled);
    await prisma.$disconnect();
    
    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error('[Toggle Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle webhook' },
      { status: 500 }
    );
  }
}
