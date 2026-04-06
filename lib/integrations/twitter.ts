/**
 * Twitter/X Integration
 * Post tweets, reply, retweet via Twitter API v2
 */

import { BaseIntegration, IntegrationConnection } from './base';
import { prisma } from '../prisma';

export class TwitterIntegration extends BaseIntegration {
  name = 'twitter';
  
  protected oauthConfig = {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    redirectUri: process.env.TWITTER_REDIRECT_URI || '',
    scopes: [
      'tweet.read',
      'tweet.write',
      'users.read',
      'offline.access',
      'follows.read',
      'follows.write',
    ],
    pkce: true,
  };

  async connect(userId: string, code: string): Promise<IntegrationConnection> {
    const tokens = await this.exchangeCode(code);
    
    // Get user info
    const user = await this.makeRequest(
      { accessToken: tokens.accessToken } as IntegrationConnection,
      {
        method: 'GET',
        url: 'https://api.twitter.com/2/users/me',
        params: { 'user.fields': 'username,name,profile_image_url' },
        parseJson: true,
      }
    );

    const connection = await prisma.integrationConnection.create({
      data: {
        integrationId: 'twitter',
        userId,
        accountName: `@${user.data.username}`,
        accountId: user.data.id,
        accessToken: await this.encrypt(tokens.accessToken!),
        refreshToken: tokens.refreshToken ? await this.encrypt(tokens.refreshToken) : null,
        tokenExpiry: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
        scopes: tokens.scopes || [],
        status: 'active',
        metadata: {
          username: user.data.username,
          name: user.data.name,
        },
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
        'Authorization': 'Basic ' + Buffer.from(
          `${this.oauthConfig.clientId}:${this.oauthConfig.clientSecret}`
        ).toString('base64'),
      },
      body: new URLSearchParams({
        refresh_token: await this.decrypt(connection.refreshToken!),
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    
    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: await this.encrypt(data.access_token),
        refreshToken: data.refresh_token ? await this.encrypt(data.refresh_token) : null,
      },
    });
  }

  async test(connection: IntegrationConnection): Promise<boolean> {
    try {
      await this.makeRequest(connection, {
        method: 'GET',
        url: 'https://api.twitter.com/2/users/me',
        parseJson: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Post a tweet
   */
  async postTweet(
    connection: IntegrationConnection,
    text: string,
    options?: {
      replyTo?: string;
      quoteTweetId?: string;
      mediaIds?: string[];
    }
  ): Promise<{ tweetId: string }> {
    const body: any = { text };
    
    if (options?.replyTo) {
      body.reply = { in_reply_to_tweet_id: options.replyTo };
    }
    if (options?.quoteTweetId) {
      body.quote_tweet_id = options.quoteTweetId;
    }
    if (options?.mediaIds?.length) {
      body.media = { media_ids: options.mediaIds };
    }

    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: 'https://api.twitter.com/2/tweets',
      body,
      parseJson: true,
    });

    return { tweetId: response.data.id };
  }

  /**
   * Reply to a tweet
   */
  async replyToTweet(
    connection: IntegrationConnection,
    tweetId: string,
    text: string
  ): Promise<{ tweetId: string }> {
    return this.postTweet(connection, text, { replyTo: tweetId });
  }

  /**
   * Retweet
   */
  async retweet(
    connection: IntegrationConnection,
    tweetId: string
  ): Promise<{ retweetId: string }> {
    const userId = (connection.metadata as any)?.userId;
    
    const response = await this.makeRequest(connection, {
      method: 'POST',
      url: `https://api.twitter.com/2/users/${userId}/retweets`,
      body: { tweet_id: tweetId },
      parseJson: true,
    });

    return { retweetId: response.data.id };
  }

  /**
   * Get user timeline
   */
  async getTimeline(
    connection: IntegrationConnection,
    userId: string,
    options: { maxResults?: number; exclude?: string[] } = {}
  ): Promise<any[]> {
    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: `https://api.twitter.com/2/users/${userId}/tweets`,
      params: {
        max_results: (options.maxResults || 10).toString(),
        exclude: options.exclude?.join(','),
        'tweet.fields': 'created_at,public_metrics,context_annotations',
      },
      parseJson: true,
    });

    return response.data || [];
  }

  /**
   * Search tweets
   */
  async searchTweets(
    connection: IntegrationConnection,
    query: string,
    options: { maxResults?: number; fromDate?: string; toDate?: string } = {}
  ): Promise<any[]> {
    const queryParams: Record<string, string> = {
      query,
      max_results: (options.maxResults || 10).toString(),
      'tweet.fields': 'created_at,author_id,public_metrics',
    };

    if (options.fromDate) {
      queryParams.from_date = options.fromDate;
    }
    if (options.toDate) {
      queryParams.to_date = options.toDate;
    }

    const response = await this.makeRequest(connection, {
      method: 'GET',
      url: 'https://api.twitter.com/2/tweets/search/recent',
      params: queryParams,
      parseJson: true,
    });

    return response.data || [];
  }
}
