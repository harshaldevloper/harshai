import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { executeWorkflow } from '@/lib/execution-engine';
import { getTemplateById } from '@/lib/templates';
import { 
  getWebhooksDueForRetry, 
  markDeliverySuccess, 
  markDeliveryFailed,
  isRetryableStatusCode,
  isRetryableError,
} from '@/lib/webhook-retry-engine';

const prisma = new PrismaClient();

/**
 * POST /api/cron/process-webhook-retries
 * 
 * Cron job that runs every 5 minutes to process webhook retries
 * Protected by cron secret
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    console.log('[Cron] Processing webhook retries...');
    
    // Get webhooks due for retry
    const webhooks = await getWebhooksDueForRetry(50);
    
    if (webhooks.length === 0) {
      console.log('[Cron] No webhooks due for retry');
      return NextResponse.json({
        success: true,
        message: 'No webhooks due for retry',
        processed: 0,
      });
    }
    
    console.log(`[Cron] Processing ${webhooks.length} webhook retries`);
    
    const results = {
      success: 0,
      failed: 0,
      pending: 0,
    };
    
    // Process each webhook
    for (const webhookLog of webhooks) {
      try {
        // Update delivery status to 'sending'
        const pendingDelivery = await prisma.webhookDelivery.findFirst({
          where: {
            webhookLogId: webhookLog.id,
            status: 'pending',
          },
          orderBy: { createdAt: 'desc' },
        });
        
        if (!pendingDelivery) {
          console.error(`[Cron] No pending delivery found for webhook ${webhookLog.id}`);
          continue;
        }
        
        await prisma.webhookDelivery.update({
          where: { id: pendingDelivery.id },
          data: { status: 'sending' },
        });
        
        // Get workflow definition
        let workflowNodes, workflowEdges, workflowName;
        
        const template = getTemplateById(webhookLog.workflowId);
        if (template) {
          workflowNodes = template.nodes;
          workflowEdges = template.edges;
          workflowName = template.name;
        } else {
          workflowNodes = webhookLog.workflow.nodes;
          workflowEdges = webhookLog.workflow.edges;
          workflowName = webhookLog.workflow.name;
        }
        
        if (!workflowNodes || !workflowEdges) {
          throw new Error('Workflow definition not found');
        }
        
        // Execute workflow
        const startTime = Date.now();
        const result = await executeWorkflow(
          webhookLog.workflowId,
          workflowName,
          workflowNodes as any,
          workflowEdges as any,
          webhookLog.payload
        );
        
        const responseTime = Date.now() - startTime;
        
        if (result.success) {
          // Mark as delivered
          await markDeliverySuccess(
            webhookLog.id,
            pendingDelivery.id,
            200,
            responseTime,
            result.output
          );
          
          // Update workflow run count
          await prisma.workflow.update({
            where: { id: webhookLog.workflowId },
            data: { runs: { increment: 1 }, lastExecutedAt: new Date() },
          });
          
          results.success++;
          console.log(`[Cron] Webhook ${webhookLog.id} delivered successfully (attempt ${pendingDelivery.attemptNumber})`);
        } else {
          // Mark as failed
          const retryResult = await markDeliveryFailed(
            webhookLog.id,
            pendingDelivery.id,
            null,
            result.error || 'Workflow execution failed',
            responseTime
          );
          
          if (retryResult.shouldRetry) {
            results.pending++;
            console.log(`[Cron] Webhook ${webhookLog.id} failed, retry scheduled (attempt ${pendingDelivery.attemptNumber})`);
          } else {
            results.failed++;
            console.log(`[Cron] Webhook ${webhookLog.id} failed permanently: ${retryResult.reason}`);
            
            // TODO: Send failure notification to user
            // await sendFailureNotification(webhookLog.workflow.userId, webhookLog);
          }
        }
      } catch (error) {
        console.error(`[Cron] Error processing webhook ${webhookLog.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isRetryable = isRetryableError(errorMessage);
        
        if (isRetryable && webhookLog.retryCount < webhookLog.maxRetries) {
          // Schedule retry
          await markDeliveryFailed(
            webhookLog.id,
            (await prisma.webhookDelivery.findFirst({
              where: { webhookLogId: webhookLog.id, status: 'pending' },
            }))?.id || '',
            null,
            errorMessage
          );
          results.pending++;
        } else {
          // Mark as permanently failed
          await prisma.webhookLog.update({
            where: { id: webhookLog.id },
            data: {
              status: 'failed',
              error: errorMessage,
              nextRetryAt: null,
            },
          });
          results.failed++;
        }
      }
    }
    
    console.log(`[Cron] Retry processing complete: ${results.success} success, ${results.failed} failed, ${results.pending} pending`);
    
    return NextResponse.json({
      success: true,
      message: 'Retry processing complete',
      processed: webhooks.length,
      results,
    });
  } catch (error) {
    console.error('[Cron] Fatal error processing retries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/cron/process-webhook-retries
 * 
 * Health check for cron endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook retry cron job is active',
    schedule: '*/5 * * * *',
  });
}
