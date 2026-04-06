/**
 * GitHub Integration
 * Create issues, PRs, manage repos via GitHub API
 */

import { BaseIntegration, IntegrationConnection } from './base';
import { prisma } from '../prisma';

export class GitHubIntegration extends BaseIntegration {
  name = 'github';
  
  protected oauthConfig = {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    redirectUri: process.env.GITHUB_REDIRECT_URI || '',
    scopes: ['repo', 'user', 'read:org', 'write:repo_hook'],
  };

  async connect(userId: string, code: string): Promise<IntegrationConnection> {
    const response = await fetch(this.oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.oauthConfig.clientId,
        client_secret: this.oauthConfig.clientSecret,
        code,
        redirect_uri: this.oauthConfig.redirectUri,
      }),
    });

    const data = await response.json();
    
    // Get user info
    const user = await this.makeRequest(
      { accessToken: data.access_token } as IntegrationConnection,
      {
        method: 'GET',
        url: 'https://api.github.com/user',
        parseJson: true,
      }
    );

    const connection = await prisma.integrationConnection.create({
      data: {
        integrationId: 'github',
        userId,
        accountName: user.login,
        accountId: String(user.id),
        accessToken: await this.encrypt(data.access_token),
        scopes: data.scope?.split(',') || [],
        status: 'active',
        metadata: {
          login: user.login,
          name: user.name,
          avatar: user.avatar_url,
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
    // GitHub OAuth tokens don't expire by default
  }

  async test(connection: IntegrationConnection): Promise<boolean> {
    try {
      await this.makeRequest(connection, {
        method: 'GET',
        url: 'https://api.github.com/user',
        parseJson: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create an issue
   */
  async createIssue(
    connection: IntegrationConnection,
    options: {
      owner: string;
      repo: string;
      title: string;
      body?: string;
      labels?: string[];
      assignees?: string[];
      milestone?: number;
    }
  ): Promise<{ issueId: number; url: string }> {
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: `https://api.github.com/repos/${options.owner}/${options.repo}/issues`,
      body: {
        title: options.title,
        body: options.body,
        labels: options.labels,
        assignees: options.assignees,
        milestone: options.milestone,
      },
      parseJson: true,
    });

    return {
      issueId: response.number,
      url: response.html_url,
    };
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    connection: IntegrationConnection,
    options: {
      owner: string;
      repo: string;
      title: string;
      body?: string;
      head: string;
      base: string;
      draft?: boolean;
    }
  ): Promise<{ prId: number; url: string }> {
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: `https://api.github.com/repos/${options.owner}/${options.repo}/pulls`,
      body: {
        title: options.title,
        body: options.body,
        head: options.head,
        base: options.base,
        draft: options.draft,
      },
      parseJson: true,
    });

    return {
      prId: response.number,
      url: response.html_url,
    };
  }

  /**
   * Get repository info
   */
  async getRepo(
    connection: IntegrationConnection,
    owner: string,
    repo: string
  ): Promise<any> {
    return await this.makeRequest(connection, {
      method: 'GET',
      url: `https://api.github.com/repos/${owner}/${repo}`,
      parseJson: true,
    });
  }

  /**
   * List issues
   */
  async listIssues(
    connection: IntegrationConnection,
    options: {
      owner: string;
      repo: string;
      state?: 'open' | 'closed' | 'all';
      labels?: string[];
      limit?: number;
    }
  ): Promise<any[]> {
    const params: Record<string, string> = {
      state: options.state || 'open',
      per_page: (options.limit || 30).toString(),
    };

    if (options.labels?.length) {
      params.labels = options.labels.join(',');
    }

    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: `https://api.github.com/repos/${options.owner}/${options.repo}/issues`,
      params,
      parseJson: true,
    });

    return response || [];
  }

  /**
   * Create a webhook
   */
  async createWebhook(
    connection: IntegrationConnection,
    options: {
      owner: string;
      repo: string;
      url: string;
      events?: string[];
      secret?: string;
    }
  ): Promise<{ webhookId: number }> {
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: `https://api.github.com/repos/${options.owner}/${options.repo}/hooks`,
      body: {
        name: 'web',
        config: {
          url: options.url,
          content_type: 'json',
          secret: options.secret,
        },
        events: options.events || ['push', 'pull_request', 'issues'],
        active: true,
      },
      parseJson: true,
    });

    return { webhookId: response.id };
  }

  /**
   * List user repositories
   */
  async listRepos(connection: IntegrationConnection, limit: number = 30): Promise<any[]> {
    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://api.github.com/user/repos',
      params: { per_page: limit.toString() },
      parseJson: true,
    });

    return response || [];
  }
}
