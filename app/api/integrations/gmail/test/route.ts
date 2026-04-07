/**
 * POST /api/integrations/gmail/test
 * Test Gmail API connection
 */

import { NextResponse } from 'next/server';
import { testGmailConnection } from '@/lib/integrations/gmail';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock success without API key
      console.log('[Gmail Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Gmail integration ready (mock responses)',
        testMode: true,
        mockEmail: 'test@example.com',
        mockResponse: {
          messageId: 'mock-message-123',
          threadId: 'mock-thread-456',
        }
      });
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required. Enable TEST_MODE or provide an access token.' },
        { status: 400 }
      );
    }
    
    const result = await testGmailConnection(accessToken);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Gmail Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
