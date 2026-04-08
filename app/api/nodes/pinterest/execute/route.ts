/**
 * POST /api/nodes/pinterest/execute
 * Execute Pinterest create pin node
 */

import { NextResponse } from 'next/server';
import { createPin } from '@/lib/integrations/pinterest';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Pinterest Execute] TEST_MODE enabled - returning mock pin created');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          pinId: 'mock-pin-' + Date.now(),
          url: 'https://pinterest.com/pin/mock-' + Date.now(),
          message: 'Pin created successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Pinterest access token required' },
        { status: 400 }
      );
    }
    
    if (!input?.boardId || !input?.title || !input?.mediaSource) {
      return NextResponse.json(
        { success: false, error: 'Board ID, title, and media source required' },
        { status: 400 }
      );
    }
    
    const result = await createPin(
      {
        boardId: input.boardId,
        title: input.title,
        description: input.description || '',
        mediaSource: input.mediaSource,
        link: input.link,
      },
      config
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Pinterest Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
