/**
 * POST /api/integrations/twitter/test
 * Test Twitter/X API connection
 */

import { NextResponse } from 'next/server';
import { testTwitterConnection } from '@/lib/integrations/twitter';

export async function POST(request: Request) {
  try {
    const { bearerToken } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Twitter Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Twitter/X integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          tweetId: 'mock-tweet-123',
          text: 'Mock tweet (test mode)',
        }
      });
    }
    
    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: 'Bearer token is required. Enable TEST_MODE or provide a token.' },
        { status: 400 }
      );
    }
    
    const result = await testTwitterConnection(bearerToken);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Twitter Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
