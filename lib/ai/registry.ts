/**
 * AI Provider Registry
 * Unified interface for all AI providers
 */

import { OpenAiProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { StabilityProvider } from './stability';
import { ElevenLabsProvider } from './elevenlabs';

class AiRegistry {
  private providers: Map<string, any> = new Map();

  constructor() {
    // Initialize with environment variables if available
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAiProvider({
        apiKey: process.env.OPENAI_API_KEY,
      }));
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider({
        apiKey: process.env.ANTHROPIC_API_KEY,
      }));
    }
    if (process.env.STABILITY_API_KEY) {
      this.providers.set('stability', new StabilityProvider({
        apiKey: process.env.STABILITY_API_KEY,
      }));
    }
    if (process.env.ELEVENLABS_API_KEY) {
      this.providers.set('elevenlabs', new ElevenLabsProvider({
        apiKey: process.env.ELEVENLABS_API_KEY,
      }));
    }
  }

  getProvider(name: string): any {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`AI provider "${name}" not configured`);
    }
    return provider;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const aiRegistry = new AiRegistry();

/**
 * Estimate cost for AI generation
 */
export function estimateCost(
  provider: string,
  model: string,
  tokens: number,
  type: 'input' | 'output' = 'output'
): number {
  const pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    },
    anthropic: {
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    },
  };

  const providerPricing = pricing[provider]?.[model];
  if (!providerPricing) return 0;

  const rate = type === 'input' ? providerPricing.input : providerPricing.output;
  return (tokens / 1000) * rate;
}
