/**
 * POST /api/integrations/anthropic/test
 * Test Anthropic API connection
 */

import { NextResponse } from 'next/server';
import { testAnthropicConnection } from '@/lib/integrations/anthropic';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock success without API key
      console.log('[Anthropic Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Claude integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          id: 'test-mock-456',
          content: [{ type: 'text', text: 'This is a test response from Claude (mock)' }],
          usage: { input_tokens: 10, output_tokens: 20 }
        }
      });
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required. Enable TEST_MODE or provide an API key.' },
        { status: 400 }
      );
    }
    
    const result = await testAnthropicConnection(apiKey);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Anthropic Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
