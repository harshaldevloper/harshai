/**
 * OpenAI Integration - ChatGPT API
 * Supports: GPT-4, GPT-3.5-turbo, text completion, chat completion
 */

import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  testMode?: boolean;
}

export interface OpenAIInput {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  config: OpenAIConfig;
}

export interface OpenAIOutput {
  success: boolean;
  content?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  error?: string;
}

/**
 * Execute OpenAI Chat Completion
 */
export async function executeOpenAIChat(input: OpenAIInput): Promise<OpenAIOutput> {
  try {
    const { messages, config } = input;
    
    // Test Mode - return mock response without API call
    if (config.testMode) {
      console.log('[OpenAI] Test Mode: Simulating ChatGPT response');
      return {
        success: true,
        content: '[Test Mode] This is a test response from ChatGPT. In production, this would be the actual AI response.',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30
        },
        model: 'gpt-4-turbo (test)'
      };
    }

    // Validate API key for live mode
    if (!config.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key is required. Add it in Settings > Integrations or enable Test Mode.'
      };
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: config.apiKey,
    });

    // Build messages array
    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    // Add system prompt if provided
    if (config.systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: config.systemPrompt
      });
    }
    
    // Add user messages
    formattedMessages.push(...messages);

    // Make API call
    const completion = await client.chat.completions.create({
      model: config.model || 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 1024,
    });

    // Extract response
    const choice = completion.choices[0];
    if (!choice || !choice.message) {
      return {
        success: false,
        error: 'No response from OpenAI API'
      };
    }

    return {
      success: true,
      content: choice.message.content || '',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      },
      model: completion.model
    };

  } catch (error: any) {
    console.error('[OpenAI] Error:', error);
    
    // Handle common errors
    if (error.status === 401) {
      return {
        success: false,
        error: 'Invalid OpenAI API key. Check your key in Settings > Integrations.'
      };
    }
    
    if (error.status === 429) {
      return {
        success: false,
        error: 'OpenAI rate limit exceeded. Wait a moment and try again.'
      };
    }
    
    if (error.status === 500) {
      return {
        success: false,
        error: 'OpenAI API error. Try again later.'
      };
    }

    return {
      success: false,
      error: error.message || 'Unknown error calling OpenAI API'
    };
  }
}

/**
 * Test OpenAI Connection
 */
export async function testOpenAIConnection(apiKey: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = new OpenAI({ apiKey });
    
    // Simple test call
    await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
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
export function getOpenAIMockResponse(input: OpenAIInput): OpenAIOutput {
  return {
    success: true,
    content: `[TEST MODE] This is a mock OpenAI response.\n\nIn production, this would call the real OpenAI API with your prompt:\n\n"${input.messages[input.messages.length - 1]?.content}"\n\nModel: ${input.config.model}\nTemperature: ${input.config.temperature ?? 0.7}`,
    usage: {
      promptTokens: 50,
      completionTokens: 100,
      totalTokens: 150
    },
    model: input.config.model
  };
}
