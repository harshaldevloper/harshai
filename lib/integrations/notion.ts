/**
 * Notion Integration
 * Create pages, update databases
 */

const NOTION_API_URL = 'https://api.notion.com/v1';

export interface NotionConfig {
  apiKey: string;
  databaseId?: string;
  testMode?: boolean;
}

export interface NotionPage {
  parent: { database_id: string };
  properties: Record<string, any>;
}

export interface NotionResponse {
  success: boolean;
  pageId?: string;
  url?: string;
  error?: string;
}

/**
 * Create a page in Notion
 */
export async function createPage(
  properties: Record<string, any>,
  config: NotionConfig
): Promise<NotionResponse> {
  try {
    // Test Mode - return mock response without API call
    if (config.testMode) {
      console.log('[Notion] Test Mode: Simulating page creation');
      return {
        success: true,
        pageId: 'test-page-' + Date.now(),
        url: 'https://notion.so/test-page',
      };
    }

    // Validate API key for live mode
    if (!config.apiKey) {
      return {
        success: false,
        error: 'Notion API key is required. Add it in Settings > Integrations or enable Test Mode.',
      };
    }

    const response = await fetch(`${NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Notion API error: ${error.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      pageId: result.id,
      url: result.url,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create page',
    };
  }
}

/**
 * Test Notion API connection
 */
export async function testNotionConnection(apiKey: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${NOTION_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
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
      message: `Connected as ${user.name || user.bot?.owner?.user?.name || 'Bot'}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
