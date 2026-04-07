/**
 * POST /api/nodes/openai/execute
 * Execute an OpenAI (ChatGPT) action node
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { executeOpenAIChat, getOpenAIMockResponse, OpenAIInput } from '@/lib/integrations/openai';
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
    
    // Prepare OpenAI input
    const openAIInput: OpenAIInput = {
      messages: inputData?.messages || [
        {
          role: 'user',
          content: inputData?.prompt || inputData?.input || 'Hello'
        }
      ],
      config: {
        apiKey: config?.apiKey || process.env.OPENAI_API_KEY || '',
        model: config?.model || 'gpt-3.5-turbo',
        temperature: config?.temperature ?? 0.7,
        maxTokens: config?.maxTokens ?? 1024,
        systemPrompt: config?.systemPrompt
      }
    };
    
    // Execute in Test Mode or Production
    let result;
    if (testMode || !openAIInput.config.apiKey) {
      console.log('[OpenAI] Test Mode - using mock response');
      result = getOpenAIMockResponse(openAIInput);
    } else {
      console.log('[OpenAI] Production Mode - calling real API');
      result = await executeOpenAIChat(openAIInput);
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
          duration: 0, // TODO: track actual duration
        }
      });
    }
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, testMode: testMode || !openAIInput.config.apiKey },
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
      testMode: testMode || !openAIInput.config.apiKey
    });
    
  } catch (error: any) {
    console.error('[OpenAI Execute] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute OpenAI action' },
      { status: 500 }
    );
  }
}
