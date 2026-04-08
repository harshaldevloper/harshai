/**
 * POST /api/nodes/api-call/execute
 * Execute an API call node
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { makeApiCall } from '@/lib/api-client';
import { checkQuota } from '@/lib/quota-manager';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { nodeId, workflowId, executionId, inputData } = await request.json();
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check quota
    const quotaStatus = await checkQuota(user.id);
    if (!quotaStatus.hasQuota) {
      return NextResponse.json(
        { error: 'Quota exceeded' },
        { status: 429 }
      );
    }
    
    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, workflowId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toISOString(),
          },
        }
      );
    }
    
    // Get workflow to access node configuration
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    
    const nodes = workflow.nodes as any[];
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }
    
    // Build API call config from node data
    const config = {
      method: node.data.method,
      url: interpolateVariables(node.data.url, inputData),
      auth: node.data.authType === 'oauth'
        ? {
            type: 'bearer' as const,
            token: await getConnectionToken(node.data.connectionId),
          }
        : node.data.authType === 'api-key'
        ? {
            type: 'api-key' as const,
            apiKey: node.data.apiKey,
            apiKeyName: node.data.apiKeyName,
            apiKeyLocation: node.data.apiKeyLocation || 'header',
          }
        : undefined,
      headers: node.data.headers || {},
      queryParams: node.data.queryParams || {},
      body: node.data.body ? {
        type: node.data.body.type as 'json' | 'form-data' | 'raw',
        content: interpolateVariables(node.data.body.content, inputData),
      } : undefined,
      timeout: node.data.timeout || 30000,
      parseResponse: node.data.parseResponse !== false,
      outputMapping: node.data.outputMapping,
      retryCount: node.data.retryCount || 0,
    };
    
    // Execute API call
    const result = await makeApiCall(config);
    
    return NextResponse.json({
      success: true,
      output: result.output || result.data,
      metadata: {
        status: result.status,
        duration: result.duration,
      },
    });
  } catch (error: any) {
    console.error('API call execution error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Interpolate variables in string (e.g., {{input.field}})
 */
function interpolateVariables(str: string, data: any): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.split('.');
    let value: any = data;
    for (const key of keys) {
      value = value?.[key];
    }
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Get access token from connection
 */
async function getConnectionToken(connectionId: string): Promise<string> {
  const connection = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
  });
  
  if (!connection) {
    throw new Error('Connection not found');
  }
  
  // In production, decrypt the token
  return connection.accessToken;
}
