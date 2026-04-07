/**
 * POST /api/integrations/openai/test
 * Test OpenAI API connection
 */

import { NextResponse } from 'next/server';
import { testOpenAIConnection } from '@/lib/integrations/openai';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
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
