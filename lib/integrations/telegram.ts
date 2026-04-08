/**
 * Telegram Integration
 * Send messages to chats/channels
 */

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export interface TelegramConfig {
  botToken: string;
}

export interface TelegramMessage {
  chatId: string | number;
  text: string;
}

export async function sendTelegramMessage(message: TelegramMessage, config: TelegramConfig) {
  try {
    const url = `${TELEGRAM_API_URL}${config.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: message.chatId, text: message.text }),
    });
    const result = await response.json();
    if (!result.ok) return { success: false, error: result.description };
    return { success: true, messageId: result.result.message_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testTelegramConnection(botToken: string) {
  try {
    const url = `${TELEGRAM_API_URL}${botToken}/getMe`;
    const response = await fetch(url);
    const result = await response.json();
    if (!result.ok) return { success: false, error: result.description };
    return { success: true, message: `Connected as @${result.result.username}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
