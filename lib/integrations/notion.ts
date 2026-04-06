/**
 * Notion Integration
 * Create pages, update databases, query via Notion API
 */

import { BaseIntegration, IntegrationConnection } from './base';
import { prisma } from '../prisma';

export class NotionIntegration extends BaseIntegration {
  name = 'notion';
  
  protected oauthConfig = {
    clientId: process.env.NOTION_CLIENT_ID || '',
    clientSecret: process.env.NOTION_CLIENT_SECRET || '',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    redirectUri: process.env.NOTION_REDIRECT_URI || '',
    scopes: [],
  };

  async connect(userId: string, code: string): Promise<IntegrationConnection> {
    const response = await fetch(this.oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(
          `${this.oauthConfig.clientId}:${this.oauthConfig.clientSecret}`
        ).toString('base64'),
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.oauthConfig.redirectUri,
      }),
    });

    const data = await response.json();
    
    const connection = await prisma.integrationConnection.create({
      data: {
        integrationId: 'notion',
        userId,
        accountName: data.workspace_name || 'Notion Workspace',
        accountId: data.workspace_id,
        accessToken: await this.encrypt(data.access_token),
        scopes: [],
        status: 'active',
        metadata: {
          workspaceIcon: data.workspace_icon,
          botId: data.bot_id,
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
    // Notion tokens don't expire
  }

  async test(connection: IntegrationConnection): Promise<boolean> {
    try {
      await this.makeRequest(connection, {
        method: 'GET',
        url: 'https://api.notion.com/v1/users/me',
        parseJson: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new page
   */
  async createPage(
    connection: IntegrationConnection,
    options: {
      parentDatabaseId?: string;
      parentPageId?: string;
      title?: string;
      properties?: Record<string, any>;
      content?: Array<{ type: string; [key: string]: any }>;
    }
  ): Promise<{ pageId: string; url: string }> {
    const parent = options.parentDatabaseId
      ? { database_id: options.parentDatabaseId }
      : { page_id: options.parentPageId };

    const body: any = {
      parent,
      properties: options.properties || {},
    };

    if (options.title && !options.properties?.title) {
      body.properties.title = {
        title: [{ text: { content: options.title } }],
      };
    }

    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: 'https://api.notion.com/v1/pages',
      body,
      parseJson: true,
    });

    // Add content blocks if provided
    if (options.content && options.content.length > 0) {
      await this.appendBlocks(connection, response.id, options.content);
    }

    return { pageId: response.id, url: response.url };
  }

  /**
   * Update page properties
   */
  async updatePage(
    connection: IntegrationConnection,
    pageId: string,
    properties: Record<string, any>
  ): Promise<void> {
    await this.makeRequest(connection, {
      method: 'PATCH',
      url: `https://api.notion.com/v1/pages/${pageId}`,
      body: { properties },
      parseJson: true,
    });
  }

  /**
   * Query a database
   */
  async queryDatabase(
    connection: IntegrationConnection,
    databaseId: string,
    options: {
      filter?: any;
      sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>;
      pageSize?: number;
    } = {}
  ): Promise<any[]> {
    const body: any = {
      filter: options.filter,
      sorts: options.sorts,
      page_size: options.pageSize || 100,
    };

    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: `https://api.notion.com/v1/databases/${databaseId}/query`,
      body,
      parseJson: true,
    });

    return response.results || [];
  }

  /**
   * Append blocks to a page
   */
  async appendBlocks(
    connection: IntegrationConnection,
    pageId: string,
    blocks: Array<{ type: string; [key: string]: any }>
  ): Promise<void> {
    await this.makeRequest(connection, {
      method: 'PATCH',
      url: `https://api.notion.com/v1/blocks/${pageId}/children`,
      body: { children: blocks },
      parseJson: true,
    });
  }

  /**
   * Get database schema
   */
  async getDatabase(connection: IntegrationConnection, databaseId: string): Promise<any> {
    return await this.makeRequest(connection, {
      method: 'GET',
      url: `https://api.notion.com/v1/databases/${databaseId}`,
      parseJson: true,
    });
  }
}
