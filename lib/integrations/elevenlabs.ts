/**
 * ElevenLabs Integration
 * Text-to-speech voice generation
 */

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
  testMode?: boolean;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url: string;
}

export interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  audioBase64?: string;
  characterCount?: number;
  error?: string;
}

/**
 * Get available voices from ElevenLabs
 */
export async function getElevenLabsVoices(apiKey: string): Promise<ElevenLabsVoice[]> {
  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }

  const data = await response.json();
  return data.voices || [];
}

/**
 * Generate speech from text using ElevenLabs
 */
export async function generateSpeech(
  text: string,
  config: ElevenLabsConfig
): Promise<ElevenLabsResponse> {
  try {
    // Test Mode - return mock response without API call
    if (config.testMode) {
      console.log('[ElevenLabs] Test Mode: Simulating TTS generation');
      return {
        success: true,
        audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
        characterCount: text.length,
      };
    }

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${config.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: config.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `ElevenLabs API error: ${error}`,
      };
    }

    // Get audio as buffer
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return {
      success: true,
      audioBase64,
      characterCount: text.length,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to generate speech',
    };
  }
}

/**
 * Test ElevenLabs API connection
 */
export async function testElevenLabsConnection(apiKey: string): Promise<{
  success: boolean;
  message?: string;
  voices?: number;
  error?: string;
}> {
  try {
    const voices = await getElevenLabsVoices(apiKey);
    return {
      success: true,
      message: `Connected! ${voices.length} voices available`,
      voices: voices.length,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
