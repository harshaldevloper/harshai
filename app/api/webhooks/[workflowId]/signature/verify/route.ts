import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { verifyWebhookSignature, SignatureFormat } from '@/lib/hmac-verification';

const prisma = new PrismaClient();

/**
 * POST /api/webhooks/[workflowId]/signature/verify
 * 
 * Test HMAC signature verification
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
      select: {
        id: true,
        userId: true,
        webhookSignatureEnabled: true,
        webhookSigningSecret: true,
        signatureAlgorithm: true,
        signatureHeader: true,
        timestampTolerance: true,
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
    
    if (!workflow.webhookSigningSecret) {
      return NextResponse.json(
        { success: false, error: 'No signing secret configured. Enable HMAC verification first.' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const {
      signature,
      payload,
      format = 'custom',
      timestamp,
    } = body;
    
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Signature is required' },
        { status: 400 }
      );
    }
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Payload is required' },
        { status: 400 }
      );
    }
    
    // Determine format from signature header if not specified
    let signatureFormat: SignatureFormat = format as SignatureFormat;
    if (!signatureFormat || !['stripe', 'github', 'slack', 'custom'].includes(signatureFormat)) {
      const headerName = workflow.signatureHeader?.toLowerCase() || '';
      signatureFormat = headerName.includes('stripe') ? 'stripe' :
                       headerName.includes('github') ? 'github' :
                       headerName.includes('slack') ? 'slack' : 'custom';
    }
    
    // Create mock headers for verification
    const mockHeaders = new Headers();
    
    // Set appropriate header based on format
    switch (signatureFormat) {
      case 'stripe':
        mockHeaders.set('stripe-signature', signature);
        if (timestamp) {
          // Stripe includes timestamp in the signature header
        }
        break;
      case 'github':
        mockHeaders.set('x-hub-signature-256', signature);
        if (timestamp) {
          mockHeaders.set('x-hub-signature-timestamp', timestamp.toString());
        }
        break;
      case 'slack':
        mockHeaders.set('x-slack-signature', signature);
        if (timestamp) {
          mockHeaders.set('x-slack-request-timestamp', timestamp.toString());
        }
        break;
      case 'custom':
      default:
        mockHeaders.set(workflow.signatureHeader || 'X-Signature-256', signature);
        if (timestamp) {
          mockHeaders.set('x-timestamp', timestamp.toString());
        }
        break;
    }
    
    // Verify signature
    const result = await verifyWebhookSignature(
      mockHeaders,
      typeof payload === 'string' ? payload : JSON.stringify(payload),
      workflow.webhookSigningSecret,
      signatureFormat,
      workflow.timestampTolerance || 300
    );
    
    return NextResponse.json({
      success: result.isValid,
      verification: result,
      details: {
        algorithm: workflow.signatureAlgorithm,
        format: signatureFormat,
        tolerance: workflow.timestampTolerance,
      },
    });
  } catch (error) {
    console.error('[Webhook HMAC Verify] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
