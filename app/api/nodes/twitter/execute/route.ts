/**
 * POST /api/nodes/twitter/execute
 * Execute Twitter post tweet node
 */

import { NextResponse } from 'next/server';
import { postTweet } from '@/lib/integrations/twitter';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Twitter Execute] TEST_MODE enabled - returning mock tweet posted');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          tweetId: 'mock-tweet-' + Date.now(),
          text: input?.text || 'Mock tweet (test mode)',
          url: 'https://twitter.com/user/status/mock-' + Date.now(),
          message: 'Tweet posted successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.bearerToken) {
      return NextResponse.json(
        { success: false, error: 'Twitter bearer token required' },
        { status: 400 }
      );
    }
    
    if (!input?.text) {
      return NextResponse.json(
        { success: false, error: 'Tweet text required' },
        { status: 400 }
      );
    }
    
    if (input.text.length > 280) {
      return NextResponse.json(
        { success: false, error: 'Tweet text must be 280 characters or less' },
        { status: 400 }
      );
    }
    
    const result = await postTweet(input.text, config);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Twitter Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
