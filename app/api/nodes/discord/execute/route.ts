/**
 * POST /api/nodes/discord/execute
 * Execute Discord send message node
 */

import { NextResponse } from 'next/server';
import { sendMessage } from '@/lib/integrations/discord';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Discord Execute] TEST_MODE enabled - returning mock message sent');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          messageId: 'mock-msg-' + Date.now(),
          channelId: input?.channelId || config?.channelId || 'mock-channel',
          message: 'Message sent successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.botToken) {
      return NextResponse.json(
        { success: false, error: 'Discord bot token required' },
        { status: 400 }
      );
    }
    
    if (!input?.channelId || !input?.content) {
      return NextResponse.json(
        { success: false, error: 'Channel ID and content required' },
        { status: 400 }
      );
    }
    
    const result = await sendMessage(
      {
        channelId: input.channelId,
        content: input.content,
      },
      config
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Discord Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
