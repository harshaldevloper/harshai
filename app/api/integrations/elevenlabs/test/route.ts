/**
 * POST /api/integrations/elevenlabs/test
 * Test ElevenLabs API connection
 */

import { NextResponse } from 'next/server';
import { testElevenLabsConnection } from '@/lib/integrations/elevenlabs';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock success without API key
      console.log('[ElevenLabs Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - ElevenLabs integration ready (mock responses)',
        testMode: true,
        mockVoices: 10,
        mockResponse: {
          audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
          message: 'Mock audio generated (test mode)'
        }
      });
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required. Enable TEST_MODE or provide an API key.' },
        { status: 400 }
      );
    }
    
    const result = await testElevenLabsConnection(apiKey);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[ElevenLabs Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
