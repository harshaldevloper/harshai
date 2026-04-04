import { NextRequest, NextResponse } from 'next/server';
import { regenerateWebhookSecret, getWebhookInfo } from '@/lib/webhook-handler';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/webhooks/[workflowId]/regenerate
 * 
 * Regenerate webhook secret token
 * - Requires authentication
 * - Invalidates old webhook URL
 * - Returns new webhook URL
 */
export async function POST(
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
    
    // Regenerate secret
    const newSecret = await regenerateWebhookSecret(workflowId);
    await prisma.$disconnect();
    
    // Get updated webhook info
    const webhookInfo = await getWebhookInfo(workflowId);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook secret regenerated successfully',
      webhookUrl: webhookInfo?.webhookUrl,
      warning: 'Your old webhook URL is now invalid. Update any services using the old URL.',
    });
  } catch (error) {
    console.error('[Regenerate Webhook] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate webhook secret' },
      { status: 500 }
    );
  }
}
