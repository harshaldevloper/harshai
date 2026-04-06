/**
 * Slack Integration
 * Send messages, upload files, manage channels via Slack API
 */

import { BaseIntegration, IntegrationConnection } from './base';
import { prisma } from '../prisma';

export class SlackIntegration extends BaseIntegration {
  name = 'slack';
  
  protected oauthConfig = {
    clientId: process.env.SLACK_CLIENT_ID || '',
    clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    redirectUri: process.env.SLACK_REDIRECT_URI || '',
    scopes: [
      'chat:write',
      'channels:read',
      'channels:write',
      'files:write',
      'users:read',
      'incoming-webhook',
    ],
  };

  async connect(userId: string, code: string): Promise<IntegrationConnection> {
    const response = await fetch(this.oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.oauthConfig.clientId,
        client_secret: this.oauthConfig.clientSecret,
        code,
        redirect_uri: this.oauthConfig.redirectUri,
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack OAuth failed: ${data.error}`);
    }

    const connection = await prisma.integrationConnection.create({
      data: {
        integrationId: 'slack',
        userId,
        accountName: data.team?.name || 'Slack Workspace',
        accountId: data.team?.id || '',
        accessToken: await this.encrypt(data.access_token),
        refreshToken: null, // Slack doesn't use refresh tokens
        scopes: data.scope?.split(',') || [],
        status: 'active',
        metadata: {
          webhookUrl: data.incoming_webhook?.url,
          botUserId: data.bot_user_id,
        },
      },
    });

    return {
      ...connection,
      accessToken: data.access_token,
    } as IntegrationConnection;
  }

  async disconnect(connectionId: string): Promise<void> {
    await prisma.integrationConnection.update({
      where: { id: connectionId },
      data: { status: 'revoked' },
    });
  }

  async refresh(connection: IntegrationConnection): Promise<void> {
    // Slack tokens don't expire, no refresh needed
  }

  async test(connection: IntegrationConnection): Promise<boolean> {
    try {
      const response = await this.makeRequest(connection, {
        method: 'GET',
        url: 'https://slack.com/api/auth.test',
        parseJson: true,
      });
      return response.ok === true;
    } catch {
      return false;
    }
  }

  /**
   * Send a message to a channel or DM
   */
  async sendMessage(
    connection: IntegrationConnection,
    options: {
      channel: string;
      text: string;
      blocks?: any[];
      attachments?: any[];
      threadTs?: string;
    }
  ): Promise<{ ts: string }> {
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      body: {
        channel: options.channel,
        text: options.text,
        blocks: options.blocks,
        attachments: options.attachments,
        thread_ts: options.threadTs,
      },
      parseJson: true,
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.error}`);
    }

    return { ts: response.ts };
  }

  /**
   * Upload a file to a channel
   */
  async uploadFile(
    connection: IntegrationConnection,
    options: {
      channel: string;
      file: Buffer;
      filename: string;
      title?: string;
      initialComment?: string;
    }
  ): Promise<{ fileId: string }> {
    const formData = new FormData();
    formData.append('file', new Blob([options.file]), options.filename);
    formData.append('channels', options.channel);
    if (options.title) formData.append('title', options.title);
    if (options.initialComment) formData.append('initial_comment', options.initialComment);

    const response = await fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack file upload failed: ${data.error}`);
    }

    return { fileId: data.file.id };
  }

  /**
   * Get list of channels
   */
  async getChannels(connection: IntegrationConnection): Promise<Array<{
    id: string;
    name: string;
    isPrivate: boolean;
  }>> {
    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://slack.com/api/conversations.list',
      params: { types: 'public_channel,private_channel' },
      parseJson: true,
    });

    return (response.channels || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      isPrivate: c.is_private,
    }));
  }

  /**
   * Get user info by ID
   */
  async getUserInfo(connection: IntegrationConnection, userId: string): Promise<any> {
    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://slack.com/api/users.info',
      params: { user: userId },
      parseJson: true,
    });

    return response.user;
  }

  /**
   * Send message to incoming webhook
   */
  async postToWebhook(webhookUrl: string, payload: any): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Webhook post failed');
    }
  }
}
