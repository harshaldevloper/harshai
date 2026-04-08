/**
 * Discord Integration
 * Send messages to channels
 */

const DISCORD_API_URL = 'https://discord.com/api/v10';

export interface DiscordConfig {
  botToken: string;
}

export interface DiscordMessage {
  channelId: string;
  content: string;
}

export interface DiscordResponse {
  success: boolean;
  messageId?: string;
  channelId?: string;
  error?: string;
}

/**
 * Send message to Discord channel
 */
export async function sendMessage(
  message: DiscordMessage,
  config: DiscordConfig
): Promise<DiscordResponse> {
  try {
    const response = await fetch(
      `${DISCORD_API_URL}/channels/${message.channelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${config.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.content,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Discord API error: ${error.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
      channelId: result.channel_id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send message',
    };
  }
}

/**
 * Test Discord API connection
 */
export async function testDiscordConnection(botToken: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    const user = await response.json();
    return {
      success: true,
      message: `Connected as ${user.username}#${user.discriminator}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
