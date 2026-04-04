import { NextRequest, NextResponse } from 'next/server';
import { processWebhook, parseWebhookPayload } from '@/lib/webhook-handler';

/**
 * POST /api/webhooks/[workflowId]/[secretToken]
 * 
 * Webhook receiver endpoint
 * - Verifies secret token
 * - Parses incoming payload (JSON, form-data, x-www-form-urlencoded)
 * - Logs the webhook receipt
 * - Triggers workflow execution
 * - Returns success/error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string; secretToken: string } }
) {
  const { workflowId, secretToken } = params;
  
  try {
    // Get client IP for logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Get content type
    const contentType = request.headers.get('content-type') || 'application/json';
    
    // Parse payload
    let payload;
    try {
      payload = await parseWebhookPayload(request, contentType);
    } catch (parseError) {
      console.error('[Webhook] Payload parsing failed:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse payload. Ensure Content-Type is set correctly.' 
        },
        { status: 400 }
      );
    }
    
    console.log(`[Webhook] Received for workflow: ${workflowId}`);
    console.log(`[Webhook] IP: ${ipAddress}, UA: ${userAgent}`);
    console.log(`[Webhook] Payload:`, JSON.stringify(payload, null, 2).slice(0, 1000));
    
    // Process webhook
    const result = await processWebhook(
      workflowId,
      secretToken,
      payload,
      ipAddress,
      userAgent
    );
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        executionId: result.executionId,
        output: result.output,
        executionTime: result.executionTime,
      });
    } else {
      const statusCode = result.error?.includes('not found') ? 404 :
                        result.error?.includes('not enabled') ? 403 :
                        result.error?.includes('Invalid secret') ? 401 :
                        result.error?.includes('Rate limit') ? 429 : 500;
      
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: statusCode });
    }
  } catch (error) {
    console.error('[Webhook] Processing failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Webhook processing failed' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/[workflowId]/[secretToken]
 * 
 * Verify webhook URL is valid (for testing)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string; secretToken: string } }
) {
  const { workflowId, secretToken } = params;
  
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is active',
    workflowId,
    method: 'POST',
    documentation: 'Send POST requests with JSON payload to trigger this workflow',
  });
}
