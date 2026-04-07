/**
 * POST /api/integrations/anthropic/test
 * Test Anthropic API connection
 */

import { NextResponse } from 'next/server';
import { testAnthropicConnection } from '@/lib/integrations/anthropic';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
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
