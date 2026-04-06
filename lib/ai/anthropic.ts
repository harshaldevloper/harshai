/**
 * Anthropic Provider (Claude)
 * Text generation with Claude 3 models
 */

import Anthropic from '@anthropic-ai/sdk';

export interface AnthropicConfig {
  apiKey: string;
  baseURL?: string;
}

export interface ClaudeGenerationOptions {
  model: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  system?: string;
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: any }> }>;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  jsonMode?: boolean;
  stopSequences?: string[];
}

export class AnthropicProvider {
  private client: Anthropic;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  /**
   * Generate text with Claude
   */
  async generateClaude(options: ClaudeGenerationOptions): Promise<{
    content: string;
    stopReason: string;
    usage: { inputTokens: number; outputTokens: number };
  }> {
    const systemPrompt = options.system;
    const messages = options.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await this.client.messages.create({
      model: options.model,
      system: systemPrompt,
      messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature ?? 0.7,
      top_p: options.topP,
      top_k: options.topK,
      stop_sequences: options.stopSequences,
    });

    const textContent = response.content.find(b => b.type === 'text');
    return {
      content: textContent?.text || '',
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  /**
   * Generate with vision (image analysis)
   */
  async generateClaudeVision(options: ClaudeGenerationOptions & {
    imageUrl?: string;
    imageData?: { type: string; data: string };
  }): Promise<{
    content: string;
    stopReason: string;
    usage: { inputTokens: number; outputTokens: number };
  }> {
    const content: Array<{ type: string; [key: string]: any }> = [];

    // Add text content
    const textMessage = options.messages[options.messages.length - 1];
    if (typeof textMessage.content === 'string') {
      content.push({ type: 'text', text: textMessage.content });
    }

    // Add image
    if (options.imageUrl) {
      content.push({
        type: 'image',
        source: {
          type: 'url',
          url: options.imageUrl,
        },
      });
    } else if (options.imageData) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: options.imageData.type,
          data: options.imageData.data,
        },
      });
    }

    const messages = options.messages.slice(0, -1).concat({
      role: 'user' as const,
      content,
    });

    return this.generateClaude({
      ...options,
      messages,
    });
  }

  /**
   * Extract JSON from response
   */
  async extractJson<T>(response: string): Promise<T> {
    // Claude is good at JSON, try to parse directly
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Estimate token count
   */
  countTokens(text: string): number {
    // Claude uses ~4 chars per token similar to OpenAI
    return Math.ceil(text.length / 4);
  }
}
