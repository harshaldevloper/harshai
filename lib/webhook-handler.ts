import { PrismaClient } from '@prisma/client';
import { executeWorkflow } from './execution-engine';
import { getTemplateById } from './templates';

const prisma = new PrismaClient();

// Rate limiting: 100 requests per minute per workflow
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Payload size limit: 1MB
const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface WebhookResult {
  success: boolean;
  executionId?: string;
  output?: any;
  executionTime?: number;
  stepsExecuted?: number;
  error?: string;
}

export interface WebhookLogEntry {
  id: string;
  workflowId: string;
  payload: any;
  receivedAt: Date;
  status: string;
  response?: any;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}

/**
 * Check rate limit for a workflow
 */
function checkRateLimit(workflowId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `webhook:${workflowId}`;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

/**
 * Generate a secure random secret token
 */
export function generateWebhookSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate webhook secret
 */
export function validateWebhookSecret(providedSecret: string, storedSecret: string | null): boolean {
  if (!storedSecret) return false;
  // Use constant-time comparison to prevent timing attacks
  const crypto = require('crypto');
  return crypto.timingSafeEqual(
    Buffer.from(providedSecret),
    Buffer.from(storedSecret)
  );
}

/**
 * Parse incoming webhook payload
 * Supports JSON, form-data, and x-www-form-urlencoded
 */
export async function parseWebhookPayload(
  request: Request,
  contentType: string
): Promise<any> {
  // Check payload size
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE / 1024 / 1024}MB`);
  }

  if (contentType.includes('application/json')) {
    return await request.json();
  }
  
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
  
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const obj: Record<string, any> = {};
    formData.forEach((value, key) => {
      // Handle file uploads if needed
      if (value instanceof File) {
        obj[key] = {
          name: value.name,
          type: value.type,
          size: value.size,
        };
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
  
  // Default: try JSON, fallback to text
  try {
    return await request.json();
  } catch {
    const text = await request.text();
    return { raw: text };
  }
}

/**
 * Log webhook receipt
 */
export async function logWebhook(
  workflowId: string,
  payload: any,
  status: string,
  response?: any,
  ipAddress?: string,
  userAgent?: string,
  error?: string
): Promise<WebhookLogEntry> {
  const log = await prisma.webhookLog.create({
    data: {
      workflowId,
      payload,
      status,
      response,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
      error: error ?? undefined,
    },
  });
  
  return log as any;
}

/**
 * Get webhook logs for a workflow
 */
export async function getWebhookLogs(
  workflowId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WebhookLogEntry[]> {
  const logs = await prisma.webhookLog.findMany({
    where: { workflowId },
    orderBy: { receivedAt: 'desc' },
    take: limit,
    skip: offset,
  });
  
  // Convert null to undefined for compatibility
  return logs.map((log: any) => ({
    ...log,
    ipAddress: log.ipAddress ?? undefined,
    userAgent: log.userAgent ?? undefined,
    error: log.error ?? undefined,
    response: log.response ?? undefined,
  }));
}

/**
 * Get webhook info for a workflow
 */
export async function getWebhookInfo(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: {
      id: true,
      name: true,
      webhookEnabled: true,
      webhookSecret: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!workflow) {
    return null;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-workflow-automator.vercel.app';
  const webhookUrl = workflow.webhookSecret
    ? `${baseUrl}/api/webhooks/${workflowId}/${workflow.webhookSecret}`
    : null;
  
  // Get recent logs count
  const logsCount = await prisma.webhookLog.count({
    where: { workflowId },
  });
  
  return {
    workflowId: workflow.id,
    workflowName: workflow.name,
    webhookEnabled: workflow.webhookEnabled,
    webhookUrl,
    logsCount,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  };
}

/**
 * Regenerate webhook secret
 */
export async function regenerateWebhookSecret(workflowId: string): Promise<string> {
  const newSecret = generateWebhookSecret();
  
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { webhookSecret: newSecret },
  });
  
  return newSecret;
}

/**
 * Enable/disable webhook for a workflow
 */
export async function toggleWebhookEnabled(
  workflowId: string,
  enabled: boolean
): Promise<void> {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      webhookEnabled: enabled,
      webhookSecret: enabled ? generateWebhookSecret() : null,
    },
  });
}

/**
 * Process incoming webhook
 */
export async function processWebhook(
  workflowId: string,
  secretToken: string,
  payload: any,
  ipAddress?: string,
  userAgent?: string
): Promise<WebhookResult> {
  try {
    // Verify workflow exists and webhook is enabled
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { user: true },
    });
    
    if (!workflow) {
      await logWebhook(workflowId, payload, 'failed', undefined, ipAddress, userAgent, 'Workflow not found');
      return { success: false, error: 'Workflow not found' };
    }
    
    if (!workflow.webhookEnabled) {
      await logWebhook(workflowId, payload, 'failed', undefined, ipAddress, userAgent, 'Webhook not enabled');
      return { success: false, error: 'Webhook not enabled for this workflow' };
    }
    
    // Verify secret token
    if (!workflow.webhookSecret || !validateWebhookSecret(secretToken, workflow.webhookSecret)) {
      await logWebhook(workflowId, payload, 'failed', undefined, ipAddress, userAgent, 'Invalid secret token');
      return { success: false, error: 'Invalid secret token' };
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(workflowId);
    if (!rateLimit.allowed) {
      await logWebhook(workflowId, payload, 'failed', undefined, ipAddress, userAgent, 'Rate limit exceeded');
      return { 
        success: false, 
        error: 'Rate limit exceeded. Maximum 100 requests per minute.' 
      };
    }
    
    // Log webhook receipt
    const log = await logWebhook(workflowId, payload, 'received', undefined, ipAddress, userAgent);
    
    // Get workflow definition
    let workflowNodes, workflowEdges, workflowName;
    
    const template = getTemplateById(workflowId);
    if (template) {
      workflowNodes = template.nodes;
      workflowEdges = template.edges;
      workflowName = template.name;
    } else {
      // Try to load from database (custom workflows)
      workflowNodes = workflow.nodes;
      workflowEdges = workflow.edges;
      workflowName = workflow.name;
    }
    
    if (!workflowNodes || !workflowEdges) {
      await prisma.webhookLog.update({
        where: { id: log.id },
        data: { status: 'failed', error: 'Workflow definition not found' },
      });
      return { success: false, error: 'Workflow definition not found' };
    }
    
    // Create execution record
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        userId: workflow.userId,
        status: 'running',
        result: { status: 'started', webhookPayload: payload },
      },
    });
    
    // Update log status
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: { status: 'processing' },
    });
    
    // Execute the workflow
    const result = await executeWorkflow(
      workflowId,
      workflowName,
      workflowNodes as any,
      workflowEdges as any,
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
    
    // Update webhook log
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: result.success ? 'completed' : 'failed',
        response: result.output,
        error: result.error,
      },
    });
    
    // Update workflow run count
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { runs: { increment: 1 }, lastExecutedAt: new Date() },
    });
    
    return {
      success: result.success,
      executionId: execution.id,
      output: result.output,
      executionTime: result.executionTime,
      stepsExecuted: result.stepsExecuted,
      error: result.error,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    await logWebhook(workflowId, payload, 'failed', undefined, ipAddress, userAgent, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    await prisma.$disconnect();
  }
}
