/**
 * POST /api/nodes/anthropic/execute
 * Execute an Anthropic (Claude) action node
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { executeAnthropicChat, getAnthropicMockResponse, AnthropicInput } from '@/lib/integrations/anthropic';
import { checkQuota } from '@/lib/quota-manager';

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { nodeId, workflowId, executionId, inputData, config } = await request.json();
    
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
        { error: 'Quota exceeded. Upgrade your plan.' },
        { status: 429 }
      );
    }
    
    // Check if Test Mode is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    // Prepare Anthropic input
    const anthropicInput: AnthropicInput = {
      messages: inputData?.messages || [
        {
          role: 'user',
          content: inputData?.prompt || inputData?.input || 'Hello'
        }
      ],
      config: {
        apiKey: config?.apiKey || process.env.ANTHROPIC_API_KEY || '',
        model: config?.model || 'claude-3-sonnet-20240229',
        maxTokens: config?.maxTokens ?? 1024,
        temperature: config?.temperature ?? 0.7,
        systemPrompt: config?.systemPrompt
      }
    };
    
    // Execute in Test Mode or Production
    let result;
    if (testMode || !anthropicInput.config.apiKey) {
      console.log('[Anthropic] Test Mode - using mock response');
      result = getAnthropicMockResponse(anthropicInput);
    } else {
      console.log('[Anthropic] Production Mode - calling real API');
      result = await executeAnthropicChat(anthropicInput);
    }
    
    // Log execution
    if (executionId) {
      await prisma.executionLog.create({
        data: {
          executionId,
          nodeId,
          status: result.success ? 'completed' : 'failed',
          inputData: inputData || {},
          outputData: result,
          duration: 0,
        }
      });
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, testMode: testMode || !anthropicInput.config.apiKey },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      output: {
        content: result.content,
        usage: result.usage,
        model: result.model
      },
      testMode: testMode || !anthropicInput.config.apiKey
    });
    
  } catch (error: any) {
    console.error('[Anthropic Execute] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute Anthropic action' },
      { status: 500 }
    );
  }
}
