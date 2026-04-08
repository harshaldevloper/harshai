/**
 * Twitter/X Integration
 * Post tweets and threads
 */

const TWITTER_API_URL = 'https://api.twitter.com/2';

export interface TwitterConfig {
  bearerToken: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
}

export interface TweetResponse {
  success: boolean;
  tweetId?: string;
  text?: string;
  error?: string;
}

/**
 * Post a tweet to Twitter/X
 * Note: Requires OAuth 2.0 with write permissions
 */
export async function postTweet(
  text: string,
  config: TwitterConfig
): Promise<TweetResponse> {
  try {
    // Using Twitter API v2
    const response = await fetch(`${TWITTER_API_URL}/tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Twitter API error: ${error.error?.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      tweetId: result.data.id,
      text: result.data.text,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to post tweet',
    };
  }
}

/**
 * Test Twitter API connection
 */
export async function testTwitterConnection(bearerToken: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${TWITTER_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    const user = await response.json();
    return {
      success: true,
      message: `Connected as @${user.data.username}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
