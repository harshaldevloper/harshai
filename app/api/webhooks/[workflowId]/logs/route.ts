import { NextRequest, NextResponse } from 'next/server';
import { getWebhookLogs } from '@/lib/webhook-handler';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/webhooks/[workflowId]/logs
 * 
 * Get webhook execution logs for a workflow
 * - Requires authentication
 * - Supports pagination (limit, offset)
 * - Returns logs with payload preview
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
    
    if (!workflow) {
      await prisma.$disconnect();
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    
    // Enforce max limit
    const safeLimit = Math.min(limit, 100);
    
    // Get logs
    const logs = await getWebhookLogs(workflowId, safeLimit, offset);
    
    // Get total count
    const totalCount = await prisma.webhookLog.count({
      where: {
        workflowId,
        status: status,
      },
    });
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      logs,
      pagination: {
        limit: safeLimit,
        offset,
        totalCount,
        hasMore: offset + safeLimit < totalCount,
      },
    });
  } catch (error) {
    console.error('[Webhook Logs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get webhook logs' },
      { status: 500 }
    );
  }
}
