/**
 * Anthropic Integration - Claude API
 * Supports: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
 */

import { Anthropic } from '@anthropic-ai/sdk';

export interface AnthropicConfig {
  apiKey: string;
  model: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  testMode?: boolean;
}

export interface AnthropicInput {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  config: AnthropicConfig;
}

export interface AnthropicOutput {
  success: boolean;
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  model?: string;
  error?: string;
}

/**
 * Execute Anthropic Claude Chat
 */
export async function executeAnthropicChat(input: AnthropicInput): Promise<AnthropicOutput> {
  try {
    const { messages, config } = input;
    
    // Test Mode - return mock response without API call
    if (config.testMode) {
      console.log('[Anthropic] Test Mode: Simulating Claude response');
      return {
        success: true,
        content: '[Test Mode] This is a test response from Claude. In production, this would be the actual AI response.',
        usage: {
          inputTokens: 10,
          outputTokens: 20
        },
        model: 'claude-3-sonnet-20240229 (test)'
      };
    }

    // Validate API key for live mode
    if (!config.apiKey) {
      return {
        success: false,
        error: 'Anthropic API key is required. Add it in Settings > Integrations or enable Test Mode.'
      };
    }

    // Initialize Anthropic client
    const client = new Anthropic({
      apiKey: config.apiKey,
    });

    // Make API call
    const message = await client.messages.create({
      model: config.model || 'claude-3-sonnet-20240229',
      max_tokens: config.maxTokens || 1024,
      system: config.systemPrompt || 'You are a helpful assistant.',
      messages: messages,
      temperature: config.temperature ?? 0.7,
    });

    // Extract response
    const content = message.content[0];
    if (!content || content.type !== 'text') {
      return {
        success: false,
        error: 'No response from Anthropic API'
      };
    }

    return {
      success: true,
      content: content.text,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      },
      model: message.model
    };

  } catch (error: any) {
    console.error('[Anthropic] Error:', error);
    
    // Handle common errors
    if (error.status === 401) {
      return {
        success: false,
        error: 'Invalid Anthropic API key. Check your key in Settings > Integrations.'
      };
    }
    
    if (error.status === 429) {
      return {
        success: false,
        error: 'Anthropic rate limit exceeded. Wait a moment and try again.'
      };
    }
    
    if (error.status === 500) {
      return {
        success: false,
        error: 'Anthropic API error. Try again later.'
      };
    }

    return {
      success: false,
      error: error.message || 'Unknown error calling Anthropic API'
    };
  }
}

/**
 * Test Anthropic Connection
 */
export async function testAnthropicConnection(apiKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = new Anthropic({ apiKey });
    
    // Simple test call
    await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed'
    };
  }
}

/**
 * Mock response for Test Mode
 */
export function getAnthropicMockResponse(input: AnthropicInput): AnthropicOutput {
  return {
    success: true,
    content: `[TEST MODE] This is a mock Claude response.\n\nIn production, this would call the real Anthropic API with your prompt:\n\n"${input.messages[input.messages.length - 1]?.content}"\n\nModel: ${input.config.model}\nTemperature: ${input.config.temperature ?? 0.7}`,
    usage: {
      inputTokens: 50,
      outputTokens: 100
    },
    model: input.config.model
  };
}
