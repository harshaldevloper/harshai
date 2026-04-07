/**
 * POST /api/nodes/elevenlabs/execute
 * Execute ElevenLabs text-to-speech node
 */

import { NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/integrations/elevenlabs';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock response
      console.log('[ElevenLabs Execute] TEST_MODE enabled - returning mock audio');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
          text: input?.text || 'Mock audio (test mode)',
          characterCount: (input?.text || '').length,
          voiceId: config?.voiceId || 'mock-voice',
        },
      });
    }
    
    if (!config?.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 400 }
      );
    }
    
    if (!input?.text) {
      return NextResponse.json(
        { success: false, error: 'Text input required' },
        { status: 400 }
      );
    }
    
    const result = await generateSpeech(input.text, {
      apiKey: config.apiKey,
      voiceId: config.voiceId || 'EXAVITQu4vr4xnSDxMaL', // Default: Rachel
      modelId: config.modelId,
    });
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[ElevenLabs Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
