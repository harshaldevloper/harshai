/**
 * OpenAI Provider
 * Text generation, image generation, and text-to-speech
 */

import OpenAI from 'openai';
import { z } from 'zod';

export interface OpenAiConfig {
  apiKey: string;
  organization?: string;
  baseURL?: string;
}

export interface TextGenerationOptions {
  model: 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo';
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  jsonMode?: boolean;
  functions?: any[];
}

export interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface SpeechOptions {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
  speed?: number;
}

export class OpenAiProvider {
  private client: OpenAI;

  constructor(config: OpenAiConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      baseURL: config.baseURL,
    });
  }

  /**
   * Generate text completion
   */
  async generateChat(options: TextGenerationOptions): Promise<{
    content: string;
    finishReason: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
    functionCall?: any;
  }> {
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.jsonMode ? { type: 'json_object' } : { type: 'text' },
      functions: options.functions,
    });

    const choice = response.choices[0];
    return {
      content: choice.message.content || '',
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      functionCall: choice.message.function_call,
    };
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateImage(options: ImageGenerationOptions): Promise<{
    imageUrl: string;
    prompt: string;
    revisedPrompt?: string;
  }> {
    const response = await this.client.images.generate({
      model: 'dall-e-3',
      prompt: options.prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'standard',
      style: options.style || 'vivid',
      n: options.n || 1,
      response_format: 'url',
    });

    const image = response.data[0];
    return {
      imageUrl: image.url!,
      prompt: options.prompt,
      revisedPrompt: image.revised_prompt,
    };
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(options: SpeechOptions): Promise<{
    audioBuffer: Buffer;
    contentType: string;
  }> {
    const response = await this.client.audio.speech.create({
      model: options.model || 'tts-1',
      input: options.text,
      voice: options.voice || 'alloy',
      response_format: options.responseFormat || 'mp3',
      speed: options.speed || 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      audioBuffer: buffer,
      contentType: `audio/${options.responseFormat || 'mp3'}`,
    };
  }

  /**
   * Extract JSON from response
   */
  async extractJson<T extends z.ZodType>(response: string, schema: T): Promise<z.infer<T>> {
    // Try to find JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
  }

  /**
   * Count tokens in text
   */
  countTokens(text: string): number {
    // Rough estimation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}
