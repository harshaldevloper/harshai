/**
 * Gmail Integration
 * Send emails via Gmail API
 */

const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1';

export interface GmailConfig {
  accessToken: string;
  userId?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
}

export interface GmailResponse {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Encode email message for Gmail API
 */
function encodeEmail(message: EmailMessage): string {
  const headers = [
    `From: me`,
    `To: ${message.to}`,
    `Subject: ${message.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: text/${message.html ? 'html' : 'plain'}; charset="UTF-8"`,
    '',
    message.body,
  ].join('\r\n');

  return Buffer.from(headers).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Send email via Gmail API
 */
export async function sendEmail(
  message: EmailMessage,
  config: GmailConfig
): Promise<GmailResponse> {
  try {
    const raw = encodeEmail(message);
    
    const response = await fetch(
      `${GMAIL_API_URL}/users/${config.userId || 'me'}/messages/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Gmail API error: ${error}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
      threadId: result.threadId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Test Gmail API connection
 */
export async function testGmailConnection(accessToken: string): Promise<{
  success: boolean;
  message?: string;
  email?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${GMAIL_API_URL}/users/me/profile`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    const profile = await response.json();
    return {
      success: true,
      message: `Connected as ${profile.emailAddress}`,
      email: profile.emailAddress,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
