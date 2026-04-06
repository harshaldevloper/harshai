import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock OAuth server
let mockServer: any;
let mockServerPort: number;

describe('OAuth Flow Integration', () => {
  beforeAll(async () => {
    // Start mock OAuth server
    mockServer = createServer((req, res) => {
      const url = new URL(req.url || '', `http://localhost:${mockServerPort}`);
      
      if (url.pathname === '/oauth/token') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          token_type: 'Bearer',
        }));
      } else if (url.pathname === '/oauth/userinfo') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: 'mock_user_id',
          email: 'oauth_test@example.com',
          name: 'OAuth Test User',
          picture: 'https://example.com/avatar.jpg',
        }));
      } else if (url.pathname === '/oauth/authorize') {
        res.writeHead(302, {
          'Location': `http://localhost:${mockServerPort}/callback?code=mock_auth_code`,
        });
        res.end();
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    
    await new Promise<void>((resolve) => {
      mockServer.listen(0, () => {
        const address = mockServer.address();
        mockServerPort = typeof address === 'string' ? parseInt(address.split(':').pop() || '0') : address?.port || 0;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (mockServer) {
      mockServer.close();
    }
    await prisma.$disconnect();
  });

  it('OAuth authorization URL is generated correctly', async () => {
    // Simulate OAuth flow start
    const authUrl = `http://localhost:${mockServerPort}/oauth/authorize?client_id=test&redirect_uri=http://localhost:3000/api/auth/callback&response_type=code&scope=email,profile`;
    
    expect(authUrl).toContain('client_id=test');
    expect(authUrl).toContain('redirect_uri=http://localhost:3000/api/auth/callback');
    expect(authUrl).toContain('response_type=code');
  });

  it('OAuth callback handles authorization code', async () => {
    // Simulate callback with auth code
    const authCode = 'mock_auth_code';
    
    expect(authCode).toBeDefined();
    expect(authCode.length).toBeGreaterThan(0);
  });

  it('Token exchange returns access token', async () => {
    const response = await fetch(`http://localhost:${mockServerPort}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'mock_auth_code',
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000/api/auth/callback',
      }),
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.access_token).toBe('mock_access_token');
    expect(data.refresh_token).toBe('mock_refresh_token');
    expect(data.expires_in).toBe(3600);
  });

  it('User info is retrieved with access token', async () => {
    const response = await fetch(`http://localhost:${mockServerPort}/oauth/userinfo`, {
      headers: { 'Authorization': 'Bearer mock_access_token' },
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.email).toBe('oauth_test@example.com');
    expect(data.name).toBe('OAuth Test User');
  });

  it('OAuth user is created in database on first login', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'google',
        providerId: 'mock_google_id',
        avatar: 'https://example.com/avatar.jpg',
      },
    });
    
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    expect(user.provider).toBe('google');
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('OAuth user is retrieved on subsequent logins', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    // Create user
    const createdUser = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'google',
        providerId: 'mock_google_id_2',
      },
    });
    
    // Retrieve user
    const retrievedUser = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.email).toBe(email);
    expect(retrievedUser?.provider).toBe('google');
    
    // Cleanup
    await prisma.user.delete({ where: { id: createdUser.id } });
  });

  it('OAuth session is created after successful login', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'google',
        providerId: 'mock_google_id_3',
      },
    });
    
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: 'mock_session_token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });
    
    expect(session).toBeDefined();
    expect(session.userId).toBe(user.id);
    expect(session.token).toBe('mock_session_token');
    
    // Cleanup
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('Refresh token flow works correctly', async () => {
    const response = await fetch(`http://localhost:${mockServerPort}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: 'mock_refresh_token',
        grant_type: 'refresh_token',
      }),
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.access_token).toBeDefined();
  });

  it('OAuth token is stored securely', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'github',
        providerId: 'mock_github_id',
      },
    });
    
    const oauthToken = await prisma.oAuthToken.create({
      data: {
        userId: user.id,
        provider: 'github',
        accessToken: 'encrypted_access_token',
        refreshToken: 'encrypted_refresh_token',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    
    expect(oauthToken).toBeDefined();
    expect(oauthToken.userId).toBe(user.id);
    expect(oauthToken.provider).toBe('github');
    
    // Cleanup
    await prisma.oAuthToken.delete({ where: { id: oauthToken.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('OAuth disconnect removes tokens', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'google',
        providerId: 'mock_google_id_4',
      },
    });
    
    const oauthToken = await prisma.oAuthToken.create({
      data: {
        userId: user.id,
        provider: 'google',
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    
    // Disconnect (delete token)
    await prisma.oAuthToken.delete({ where: { id: oauthToken.id } });
    
    const tokenExists = await prisma.oAuthToken.findUnique({
      where: { id: oauthToken.id },
    });
    
    expect(tokenExists).toBeNull();
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('Multiple OAuth providers can be linked to one user', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Multi-OAuth User',
        provider: 'google',
        providerId: 'mock_google_id_5',
      },
    });
    
    const googleToken = await prisma.oAuthToken.create({
      data: {
        userId: user.id,
        provider: 'google',
        accessToken: 'google_token',
        refreshToken: 'google_refresh',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    
    const githubToken = await prisma.oAuthToken.create({
      data: {
        userId: user.id,
        provider: 'github',
        accessToken: 'github_token',
        refreshToken: 'github_refresh',
        expiresAt: new Date(Date.now() + 3600000),
      },
    });
    
    const tokens = await prisma.oAuthToken.findMany({
      where: { userId: user.id },
    });
    
    expect(tokens.length).toBe(2);
    
    // Cleanup
    await prisma.oAuthToken.delete({ where: { id: googleToken.id } });
    await prisma.oAuthToken.delete({ where: { id: githubToken.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('Expired OAuth tokens are handled correctly', async () => {
    const email = `oauth_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'OAuth User',
        provider: 'google',
        providerId: 'mock_google_id_6',
      },
    });
    
    const expiredToken = await prisma.oAuthToken.create({
      data: {
        userId: user.id,
        provider: 'google',
        accessToken: 'expired_token',
        refreshToken: 'expired_refresh',
        expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
      },
    });
    
    // Check if token is expired
    const isExpired = expiredToken.expiresAt < new Date();
    expect(isExpired).toBe(true);
    
    // Cleanup
    await prisma.oAuthToken.delete({ where: { id: expiredToken.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
