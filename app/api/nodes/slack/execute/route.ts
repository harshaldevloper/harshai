/**
 * POST /api/nodes/slack/execute
 * Execute Slack send message node
 */

import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/slack';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock response
      console.log('[Slack Execute] TEST_MODE enabled - returning mock message sent');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          ts: 'mock-' + Date.now(),
          channel: input?.channel || config?.channelId || 'C01234567',
          message: 'Message sent successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.botToken) {
      return NextResponse.json(
        { success: false, error: 'Slack bot token required' },
        { status: 400 }
      );
    }
    
    if (!input?.channel || !input?.text) {
      return NextResponse.json(
        { success: false, error: 'Channel and text are required' },
        { status: 400 }
      );
    }
    
    const result = await sendMessage(
      {
        channel: input.channel,
        text: input.text,
        username: input.username,
        iconEmoji: input.iconEmoji,
      },
      {
        botToken: config.botToken,
        channelId: config.channelId,
      }
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Slack Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
