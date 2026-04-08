/**
 * WhatsApp Integration (via Twilio)
 * Send WhatsApp messages
 */

const TWILIO_API_URL = 'https://api.twilio.com/2010-04-01';

export interface WhatsAppConfig {
  testMode?: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export async function sendWhatsAppMessage(message: WhatsAppMessage, config: WhatsAppConfig) {
  try {
    // Test Mode - return mock response
    if (config.testMode) {
      console.log('[WhatsApp] Test Mode: Simulating message');
      return { success: true, messageId: 'wa_test_' + Date.now() };
    }

    const url = `${TWILIO_API_URL}/Accounts/${config.accountSid}/Messages.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${config.fromNumber}`,
        To: `whatsapp:${message.to}`,
        Body: message.body,
      }),
    });
    const result = await response.json();
    if (!response.ok) return { success: false, error: result.message };
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testWhatsAppConnection(config: WhatsAppConfig) {
  try {
    const url = `${TWILIO_API_URL}/Accounts/${config.accountSid}/Messages.json?PageSize=1`;
    const response = await fetch(url, {
      headers: { 'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`) },
    });
    if (!response.ok) return { success: false, error: 'Connection failed' };
    return { success: true, message: 'Connected to Twilio WhatsApp API' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
