/**
 * Slack Integration
 * Send messages to Slack channels
 */

const SLACK_API_URL = 'https://slack.com/api';

export interface SlackConfig {
  botToken: string;
  channelId?: string;
  testMode?: boolean;
}

export interface SlackMessage {
  channel: string;
  text: string;
  username?: string;
  iconEmoji?: string;
}

export interface SlackResponse {
  success: boolean;
  ts?: string;
  channel?: string;
  error?: string;
}

/**
 * Send message to Slack channel
 */
export async function sendMessage(
  message: SlackMessage,
  config: SlackConfig
): Promise<SlackResponse> {
  try {
    // Test Mode - return mock response without API call
    if (config.testMode) {
      console.log('[Slack] Test Mode: Simulating message send');
      return {
        success: true,
        ts: 'test-' + Date.now(),
        channel: message.channel || config.channelId,
      };
    }

    const response = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: message.channel || config.channelId,
        text: message.text,
        username: message.username,
        icon_emoji: message.iconEmoji,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Slack API error: ${error.error || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      ts: result.ts,
      channel: result.channel,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
}

/**
 * Test Slack API connection
 */
export async function testSlackConnection(botToken: string): Promise<{
  success: boolean;
  message?: string;
  botName?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${SLACK_API_URL}/auth.test`, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      message: `Connected! Bot: ${result.bot_id}`,
      botName: result.bot_id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
