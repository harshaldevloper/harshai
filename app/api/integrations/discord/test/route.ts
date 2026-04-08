/**
 * POST /api/integrations/discord/test
 * Test Discord API connection
 */

import { NextResponse } from 'next/server';
import { testDiscordConnection } from '@/lib/integrations/discord';

export async function POST(request: Request) {
  try {
    const { botToken } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Discord Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Discord integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          messageId: 'mock-msg-123',
          channelId: 'mock-channel-456',
        }
      });
    }
    
    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Bot token is required. Enable TEST_MODE or provide a token.' },
        { status: 400 }
      );
    }
    
    const result = await testDiscordConnection(botToken);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Discord Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
