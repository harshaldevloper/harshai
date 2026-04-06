import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/webhooks/[workflowId]/signature/status
 * 
 * Get HMAC signature verification status and configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  const { workflowId } = params;
  
  try {
    // Authenticate user
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify workflow ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        userId: true,
        webhookEnabled: true,
        webhookSignatureEnabled: true,
        webhookSigningSecret: true,
        signatureAlgorithm: true,
        signatureHeader: true,
        timestampTolerance: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }
    
    if (workflow.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get recent webhook logs with signature verification status
    const recentLogs = await prisma.webhookLog.findMany({
      where: { workflowId },
      orderBy: { receivedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        receivedAt: true,
        status: true,
        error: true,
        ipAddress: true,
      },
    });
    
    // Count signature verification failures
    const signatureFailures = recentLogs.filter(
      log => log.error?.includes('signature') || log.error?.includes('Signature')
    ).length;
    
    return NextResponse.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      webhook: {
        enabled: workflow.webhookEnabled,
      },
      hmac: {
        enabled: workflow.webhookSignatureEnabled,
        algorithm: workflow.signatureAlgorithm,
        signatureHeader: workflow.signatureHeader,
        timestampTolerance: workflow.timestampTolerance,
        hasSigningSecret: !!workflow.webhookSigningSecret,
        secretPrefix: workflow.webhookSigningSecret?.split('_')[0] || null,
        configuredAt: workflow.updatedAt,
      },
      stats: {
        recentWebhooks: recentLogs.length,
        signatureFailures: signatureFailures,
        lastActivity: recentLogs[0]?.receivedAt || null,
      },
      securityLevel: workflow.webhookSignatureEnabled ? 'high' : workflow.webhookSecret ? 'medium' : 'low',
    });
  } catch (error) {
    console.error('[Webhook HMAC Status] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get status' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
