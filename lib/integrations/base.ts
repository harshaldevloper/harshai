/**
 * Base Integration Interface
 * All integrations must implement this interface
 */

export interface IIntegration {
  name: string;
  connect(userId: string, code: string): Promise<IntegrationConnection>;
  disconnect(connectionId: string): Promise<void>;
  refresh(connection: IntegrationConnection): Promise<void>;
  test(connection: IntegrationConnection): Promise<boolean>;
}

export interface IntegrationConnection {
  id: string;
  integrationId: string;
  userId: string;
  accountName: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked' | 'error';
  metadata?: Record<string, any>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  timeout?: number;
  parseJson?: boolean;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
  pkce?: boolean;
}

/**
 * Base Integration Class
 * Provides common functionality for all integrations
 */
export abstract class BaseIntegration implements IIntegration {
  abstract name: string;
  protected abstract oauthConfig: OAuthConfig;

  abstract connect(userId: string, code: string): Promise<IntegrationConnection>;
  abstract disconnect(connectionId: string): Promise<void>;
  abstract refresh(connection: IntegrationConnection): Promise<void>;
  abstract test(connection: IntegrationConnection): Promise<boolean>;

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(userId: string, redirectUri?: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.oauthConfig.clientId,
      redirect_uri: redirectUri || this.oauthConfig.redirectUri,
      response_type: 'code',
      scope: this.oauthConfig.scopes.join(' '),
      state: state || userId,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `${this.oauthConfig.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  protected async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scopes?: string[];
  }> {
    const response = await fetch(this.oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.oauthConfig.clientId,
        client_secret: this.oauthConfig.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.oauthConfig.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scopes: data.scope?.split(' ') || [],
    };
  }

  /**
   * Encrypt sensitive data (tokens)
   */
  protected async encrypt(text: string): Promise<string> {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key.slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag,
    });
  }

  /**
   * Decrypt sensitive data
   */
  protected async decrypt(encryptedJson: string): Promise<string> {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    const { iv, encrypted, authTag } = JSON.parse(encryptedJson);
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key.slice(0, 32)),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Make HTTP request with automatic token refresh
   */
  protected async makeRequest(
    connection: IntegrationConnection,
    config: RequestConfig
  ): Promise<any> {
    const headers: Record<string, string> = {
      ...config.headers,
    };

    // Add auth header
    if (connection.accessToken) {
      headers['Authorization'] = `Bearer ${connection.accessToken}`;
    }

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        timeout: config.timeout || 30000,
      });

      // Handle token expiry
      if (response.status === 401 && connection.refreshToken) {
        await this.refresh(connection);
        // Retry with new token
        headers['Authorization'] = `Bearer ${connection.accessToken}`;
        return await fetch(config.url, {
          method: config.method,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
        }).then(r => config.parseJson !== false ? r.json() : r.text());
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return config.parseJson !== false ? await response.json() : await response.text();
    } catch (error: any) {
      throw new Error(`Integration request failed: ${error.message}`);
    }
  }
}
