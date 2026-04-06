/**
 * Gmail Integration
 * Send emails, read inbox, manage labels via Gmail API
 */

import { BaseIntegration, IntegrationConnection, RequestConfig } from './base';
import { prisma } from '../prisma';

export class GmailIntegration extends BaseIntegration {
  name = 'gmail';
  
  protected oauthConfig = {
    clientId: process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUri: process.env.GMAIL_REDIRECT_URI || '',
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
  };

  async connect(userId: string, code: string): Promise<IntegrationConnection> {
    const tokens = await this.exchangeCode(code);
    
    // Get user profile to get email
    const profile = await this.makeRequest(
      { accessToken: tokens.accessToken } as IntegrationConnection,
      {
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        parseJson: true,
      }
    );

    const connection = await prisma.integrationConnection.create({
      data: {
        integrationId: 'gmail',
        userId,
        accountName: profile.email,
        accountId: profile.id,
        accessToken: await this.encrypt(tokens.accessToken!),
        refreshToken: tokens.refreshToken ? await this.encrypt(tokens.refreshToken) : null,
        tokenExpiry: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
        scopes: tokens.scopes || [],
        status: 'active',
      },
    });

    return {
      ...connection,
      accessToken: tokens.accessToken!,
      refreshToken: tokens.refreshToken,
    } as IntegrationConnection;
  }

  async disconnect(connectionId: string): Promise<void> {
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: { status: 'revoked' },
    });
  }

  async refresh(connection: IntegrationConnection): Promise<void> {
    const response = await fetch(this.oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.oauthConfig.clientId,
        client_secret: this.oauthConfig.clientSecret,
        refresh_token: await this.decrypt(connection.refreshToken!),
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: await this.encrypt(data.access_token),
        tokenExpiry: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
      },
    });
  }

  async test(connection: IntegrationConnection): Promise<boolean> {
    try {
      await this.makeRequest(connection, {
        method: 'GET',
        url: 'https://www.googleapis.com/gmail/v1/users/me/profile',
        parseJson: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send an email
   */
  async sendEmail(
    connection: IntegrationConnection,
    options: {
      to: string;
      subject: string;
      body: string;
      html?: boolean;
      cc?: string;
      bcc?: string;
      attachments?: { filename: string; content: string }[];
    }
  ): Promise<{ messageId: string }> {
    const raw = this.createRawEmail(options);
    
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: 'https://www.googleapis.com/gmail/v1/users/me/messages/send',
      body: { raw },
      parseJson: true,
    });

    return { messageId: response.id };
  }

  /**
   * Read recent emails from inbox
   */
  async readInbox(
    connection: IntegrationConnection,
    options: { maxResults?: number; query?: string } = {}
  ): Promise<Array<{
    id: string;
    from: string;
    subject: string;
    snippet: string;
    date: string;
  }>> {
    const params: Record<string, string> = {
      maxResults: (options.maxResults || 10).toString(),
    };

    if (options.query) {
      params.q = options.query;
    }

    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://www.googleapis.com/gmail/v1/users/me/messages',
      params,
      parseJson: true,
    });

    const messages = response.messages || [];
    const details = await Promise.all(
      messages.slice(0, 5).map(async (msg: any) => {
        const detail = await this.makeRequest(connection, {
          method: 'GET',
          url: `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          parseJson: true,
        });

        const headers = detail.payload.headers;
        return {
          id: msg.id,
          from: headers.find((h: any) => h.name === 'From')?.value || '',
          subject: headers.find((h: any) => h.name === 'Subject')?.value || '',
          snippet: detail.snippet,
          date: headers.find((h: any) => h.name === 'Date')?.value || '',
        };
      })
    );

    return details;
  }

  /**
   * Search messages with Gmail query
   */
  async searchMessages(
    connection: IntegrationConnection,
    query: string,
    maxResults: number = 10
  ): Promise<any[]> {
    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://www.googleapis.com/gmail/v1/users/me/messages',
      params: { q: query, maxResults: maxResults.toString() },
      parseJson: true,
    });

    return response.messages || [];
  }

  /**
   * Create a raw RFC 2822 email message
   */
  private createRawEmail(options: {
    to: string;
    subject: string;
    body: string;
    html?: boolean;
    cc?: string;
    bcc?: string;
  }): string {
    const contentType = options.html ? 'text/html; charset="utf-8"' : 'text/plain; charset="utf-8"';
    
    let email = [
      `From: me`,
      `To: ${options.to}`,
      options.cc ? `Cc: ${options.cc}` : '',
      options.bcc ? `Bcc: ${options.bcc}` : '',
      `Subject: ${options.subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: ${contentType}`,
      `Content-Transfer-Encoding: base64`,
      '',
      options.body,
    ].filter(Boolean).join('\r\n');

    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
