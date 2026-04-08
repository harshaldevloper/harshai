/**
 * Pinterest Integration
 * Create pins, boards, save products
 */

const PINTEREST_API_URL = 'https://api.pinterest.com/v5';

export interface PinterestConfig {
  accessToken: string;
}

export interface PinterestPin {
  boardId: string;
  title: string;
  description: string;
  mediaSource: {
    source_type: string;
    url?: string;
  };
  link?: string;
}

export interface PinterestResponse {
  success: boolean;
  pinId?: string;
  url?: string;
  error?: string;
}

/**
 * Create a pin on Pinterest
 */
export async function createPin(
  pin: PinterestPin,
  config: PinterestConfig
): Promise<PinterestResponse> {
  try {
    const response = await fetch(`${PINTEREST_API_URL}/pins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: pin.boardId,
        title: pin.title,
        description: pin.description,
        media_source: pin.mediaSource,
        link: pin.link,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Pinterest API error: ${error.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      pinId: result.id,
      url: result.link,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create pin',
    };
  }
}

/**
 * Test Pinterest API connection
 */
export async function testPinterestConnection(accessToken: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${PINTEREST_API_URL}/user_account`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    const account = await response.json();
    return {
      success: true,
      message: `Connected as ${account.username}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
