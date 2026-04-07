/**
 * POST /api/integrations/slack/test
 * Test Slack API connection
 */

import { NextResponse } from 'next/server';
import { testSlackConnection } from '@/lib/integrations/slack';

export async function POST(request: Request) {
  try {
    const { botToken } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock success without API key
      console.log('[Slack Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Slack integration ready (mock responses)',
        testMode: true,
        mockBotId: 'B01234567',
        mockResponse: {
          ts: '1234567890.123456',
          channel: 'C01234567',
        }
      });
    }
    
    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Bot token is required. Enable TEST_MODE or provide a bot token.' },
        { status: 400 }
      );
    }
    
    const result = await testSlackConnection(botToken);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Slack Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
