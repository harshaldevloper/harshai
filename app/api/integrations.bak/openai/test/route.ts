/**
 * POST /api/integrations/openai/test
 * Test OpenAI API connection
 */

import { NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/integrations/openai';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock success without API key
      console.log('[OpenAI Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - OpenAI integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          id: 'test-mock-123',
          choices: [{ message: { content: 'This is a test response from OpenAI (mock)' } }],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
        }
      });
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required. Enable TEST_MODE or provide an API key.' },
        { status: 400 }
      );
    }
    
    const result = await testOpenAIConnection(apiKey);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[OpenAI Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
