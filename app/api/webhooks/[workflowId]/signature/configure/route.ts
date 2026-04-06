import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { generateSigningSecret } from '@/lib/hmac-verification';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/[workflowId]/signature/configure
 * 
 * Configure HMAC signature verification for a workflow
 */
export async function POST(
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
      select: { id: true, userId: true },
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
    
    // Parse request body
    const body = await request.json();
    const {
      enabled,
      algorithm = 'sha256',
      signatureHeader = 'X-Signature-256',
      timestampTolerance = 300,
    } = body;
    
    // Validate algorithm
    if (!['sha256', 'sha512'].includes(algorithm)) {
      return NextResponse.json(
        { success: false, error: 'Invalid algorithm. Must be sha256 or sha512' },
        { status: 400 }
      );
    }
    
    // Validate tolerance
    if (timestampTolerance < 60 || timestampTolerance > 3600) {
      return NextResponse.json(
        { success: false, error: 'Timestamp tolerance must be between 60 and 3600 seconds' },
        { status: 400 }
      );
    }
    
    // Generate new signing secret if enabling
    let signingSecret = null;
    if (enabled) {
      signingSecret = generateSigningSecret('whsec');
    }
    
    // Update workflow
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        webhookSignatureEnabled: enabled,
        webhookSigningSecret: signingSecret,
        signatureAlgorithm: enabled ? algorithm : null,
        signatureHeader: enabled ? signatureHeader : null,
        timestampTolerance: enabled ? timestampTolerance : null,
      },
    });
    
    if (enabled) {
      return NextResponse.json({
        success: true,
        message: 'HMAC signature verification enabled',
        signingSecret,
        algorithm,
        signatureHeader,
        timestampTolerance,
        warning: 'Store this signing secret securely. It will not be shown again.',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'HMAC signature verification disabled',
      });
    }
  } catch (error) {
    console.error('[Webhook HMAC Configure] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Configuration failed' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/webhooks/[workflowId]/signature/configure
 * 
 * Get current HMAC configuration
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
        userId: true,
        webhookSignatureEnabled: true,
        signatureAlgorithm: true,
        signatureHeader: true,
        timestampTolerance: true,
        webhookSigningSecret: true,
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
    
    return NextResponse.json({
      success: true,
      enabled: workflow.webhookSignatureEnabled,
      algorithm: workflow.signatureAlgorithm,
      signatureHeader: workflow.signatureHeader,
      timestampTolerance: workflow.timestampTolerance,
      hasSigningSecret: !!workflow.webhookSigningSecret,
      secretPrefix: workflow.webhookSigningSecret?.split('_')[0] || null,
    });
  } catch (error) {
    console.error('[Webhook HMAC Configure GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get configuration' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
