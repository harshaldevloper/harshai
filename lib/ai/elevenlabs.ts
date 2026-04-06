/**
 * ElevenLabs Provider
 * Text-to-speech with high-quality voices
 */

export interface ElevenLabsConfig {
  apiKey: string;
}

export interface SpeechOptions {
  text: string;
  voice: string;
  model?: string;
  stability?: number;
  similarity?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export class ElevenLabsProvider {
  private apiKey: string;
  private baseURL = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(options: SpeechOptions): Promise<{
    audioBuffer: Buffer;
    contentType: string;
  }> {
    const response = await fetch(
      `${this.baseURL}/text-to-speech/${options.voice}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: options.text,
          model_id: options.model || 'eleven_monolingual_v1',
          voice_settings: {
            stability: options.stability ?? 0.5,
            similarity_boost: options.similarity ?? 0.75,
            style: options.style,
            use_speaker_boost: options.useSpeakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs error: ${error}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      audioBuffer: buffer,
      contentType: 'audio/mpeg',
    };
  }

  /**
   * List available voices
   */
  async listVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseURL}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    const data = await response.json();
    return data.voices || [];
  }

  /**
   * Get voice details
   */
  async getVoice(voiceId: string): Promise<Voice> {
    const response = await fetch(`${this.baseURL}/voices/${voiceId}`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    return response.json();
  }

  /**
   * Clone voice (requires sample audio)
   */
  async cloneVoice(options: {
    name: string;
    description?: string;
    files: Array<{ filename: string; buffer: Buffer }>;
  }): Promise<{ voiceId: string }> {
    const formData = new FormData();
    formData.append('name', options.name);
    if (options.description) {
      formData.append('description', options.description);
    }

    options.files.forEach((file, index) => {
      formData.append(
        `files`,
        new Blob([file.buffer], { type: 'audio/mpeg' }),
        file.filename
      );
    });

    const response = await fetch(`${this.baseURL}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
      },
      body: formData,
    });

    const data = await response.json();
    return { voiceId: data.voice_id };
  }
}
