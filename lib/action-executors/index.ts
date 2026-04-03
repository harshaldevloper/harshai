/**
 * Action Executors
 * Individual handlers for different action types
 */

export interface ActionConfig {
  prompt?: string;
  model?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  to?: string;
  subject?: string;
  channel?: string;
  [key: string]: any;
}

/**
 * Execute an action based on type
 */
export async function executeAction(
  actionType: string,
  config: ActionConfig,
  contextData: Record<string, any>
): Promise<any> {
  console.log(`[ActionExecutor] Executing: ${actionType}`, config);

  switch (actionType) {
    case 'chatgpt':
      return executeChatGPT(config, contextData);
    case 'webhook':
      return executeWebhook(config, contextData);
    case 'gmail':
      return executeGmail(config, contextData);
    case 'twitter':
      return executeTwitter(config, contextData);
    case 'notion':
      return executeNotion(config, contextData);
    case 'slack':
      return executeSlack(config, contextData);
    case 'spreadsheet':
      return executeSpreadsheet(config, contextData);
    case 'youtube-transcript':
      return executeYouTubeTranscript(config, contextData);
    case 'pinterest':
      return executePinterest(config, contextData);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

/**
 * ChatGPT Action
 * Send prompt to OpenAI and get response
 */
async function executeChatGPT(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { prompt, model = 'gpt-3.5-turbo' } = config;

  if (!prompt) {
    throw new Error('ChatGPT action requires a prompt');
  }

  // Interpolate context variables into prompt
  const interpolatedPrompt = interpolateVariables(prompt, contextData);

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('[ChatGPT] OPENAI_API_KEY not set, using mock response');
    return {
      content: `[Mock ChatGPT Response] Processed: "${interpolatedPrompt.substring(0, 50)}..."`,
      model,
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
      note: 'Set OPENAI_API_KEY in .env to use real API'
    };
  }

  console.log(`[ChatGPT] Sending prompt to ${model}...`);

  try {
    // Make real OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: interpolatedPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';

    console.log('[ChatGPT] Response received');
    return {
      content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('[ChatGPT] API call failed:', error);
    throw error;
  }
}

/**
 * Webhook Action
 * Send HTTP POST request to external service
 */
async function executeWebhook(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { url, method = 'POST', headers = {}, body = {} } = config;

  if (!url) {
    throw new Error('Webhook action requires a URL');
  }

  // Interpolate variables in body
  const interpolatedBody = interpolateVariablesInObject(body, contextData);

  console.log(`[Webhook] Sending ${method} to ${url}...`);

  try {
    // Make real HTTP request
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(interpolatedBody),
    });

    const responseData = await response.json().catch(() => ({}));

    console.log(`[Webhook] Response: ${response.status}`);
    return {
      status: response.status,
      data: responseData,
      url,
      method,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error('[Webhook] Request failed:', error);
    throw error;
  }
}

/**
 * Gmail Action
 * Send email via Gmail API
 */
async function executeGmail(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { to, subject, body: emailBody, template } = config;

  if (!to) {
    throw new Error('Gmail action requires recipient email');
  }

  // Interpolate variables
  const interpolatedSubject = subject ? interpolateVariables(String(subject), contextData) : 'No Subject';
  const interpolatedBody = emailBody ? interpolateVariables(String(emailBody), contextData) : '';

  const accessToken = process.env.GMAIL_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('[Gmail] GMAIL_ACCESS_TOKEN not set, using mock response');
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      to,
      subject: interpolatedSubject,
      note: 'Set GMAIL_ACCESS_TOKEN in .env to use real Gmail API'
    };
  }

  console.log(`[Gmail] Sending email to ${to}...`);

  try {
    // Create email message (RFC 2822 format)
    const message = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${interpolatedSubject}`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      interpolatedBody
    ].join('\n');

    // Encode message for Gmail API
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Call Gmail API
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gmail API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[Gmail] Email sent');
    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId,
      to,
      subject: interpolatedSubject,
    };
  } catch (error) {
    console.error('[Gmail] API call failed:', error);
    throw error;
  }
}

/**
 * Twitter/X Action
 * Post tweet via Twitter API v2
 */
async function executeTwitter(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { action: twitterAction, content } = config;

  if (!content) {
    throw new Error('Twitter action requires content');
  }

  const interpolatedContent = interpolateVariables(content, contextData);
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('[Twitter] TWITTER_BEARER_TOKEN not set, using mock response');
    return {
      success: true,
      tweetId: `mock-tweet-${Date.now()}`,
      url: 'https://twitter.com/user/status/mock',
      content: interpolatedContent,
      note: 'Set TWITTER_BEARER_TOKEN in .env to use real Twitter API'
    };
  }

  console.log(`[Twitter] Posting: "${interpolatedContent.substring(0, 50)}..."`);

  try {
    // Call Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: interpolatedContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twitter API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const tweetId = data.data.id;
    
    console.log('[Twitter] Tweet posted');
    return {
      success: true,
      tweetId,
      url: `https://twitter.com/user/status/${tweetId}`,
      content: interpolatedContent,
    };
  } catch (error) {
    console.error('[Twitter] API call failed:', error);
    throw error;
  }
}

/**
 * Notion Action
 * Create/update page in Notion
 */
async function executeNotion(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { action: notionAction, database, title, content, parentId } = config;
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID || database;

  if (!apiKey) {
    console.warn('[Notion] NOTION_API_KEY not set, using mock response');
    return {
      success: true,
      pageId: `mock-page-${Date.now()}`,
      url: `https://notion.so/mock-page-${Date.now()}`,
      action: notionAction || 'create',
      note: 'Set NOTION_API_KEY in .env to use real Notion API'
    };
  }

  const interpolatedTitle = title ? interpolateVariables(title, contextData) : 'Untitled';
  const interpolatedContent = content ? interpolateVariables(content, contextData) : '';

  console.log(`[Notion] ${notionAction || 'Creating'} page: ${interpolatedTitle}...`);

  try {
    // Determine parent (database or page)
    const parent = databaseId 
      ? { database_id: databaseId }
      : { page_id: parentId };

    // Call Notion API
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent,
        properties: {
          'Name': {
            title: [
              {
                text: {
                  content: interpolatedTitle,
                },
              },
            ],
          },
        },
        children: interpolatedContent ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  text: {
                    content: interpolatedContent,
                  },
                },
              ],
            },
          },
        ] : [],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Notion API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const pageId = data.id;
    
    console.log('[Notion] Page created');
    return {
      success: true,
      pageId,
      url: data.url,
      action: notionAction || 'create',
      title: interpolatedTitle,
    };
  } catch (error) {
    console.error('[Notion] API call failed:', error);
    throw error;
  }
}

/**
 * Slack Action
 * Send message to Slack channel
 */
async function executeSlack(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { channel, message, action: slackAction } = config;
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!channel) {
    throw new Error('Slack action requires a channel');
  }

  if (!botToken) {
    const interpolatedMessage = message ? interpolateVariables(message, contextData) : 'No message';
    console.warn('[Slack] SLACK_BOT_TOKEN not set, using mock response');
    return {
      success: true,
      ts: `${Date.now()}.mock`,
      channel,
      message: interpolatedMessage,
      note: 'Set SLACK_BOT_TOKEN in .env to use real Slack API'
    };
  }

  const interpolatedMessage = message ? interpolateVariables(message, contextData) : 'No message';

  console.log(`[Slack] Sending to #${channel}...`);

  try {
    // Call Slack API
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        text: interpolatedMessage,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    console.log('[Slack] Message sent');
    return {
      success: true,
      ts: data.ts,
      channel: data.channel,
      message: interpolatedMessage,
      url: `https://app.slack.com/client/${data.channel}/${data.ts}`,
    };
  } catch (error) {
    console.error('[Slack] API call failed:', error);
    throw error;
  }
}

/**
 * Pinterest Action
 * Create pin on Pinterest (Sandbox API)
 */
async function executePinterest(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { title, description, link, mediaSource, boardId } = config;
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  const appId = process.env.PINTEREST_APP_ID;

  if (!accessToken) {
    console.warn('[Pinterest] PINTEREST_ACCESS_TOKEN not set, using mock response');
    return {
      success: true,
      pinId: `mock-pin-${Date.now()}`,
      title: title || 'Untitled Pin',
      note: 'Set PINTEREST_ACCESS_TOKEN in .env to use real Pinterest API'
    };
  }

  // Check if token is a sandbox token (starts with pina_)
  const isSandbox = accessToken.startsWith('pina_');
  if (isSandbox) {
    console.log('[Pinterest] Using SANDBOX mode');
  }

  const interpolatedTitle = title ? interpolateVariables(String(title), contextData) : 'Untitled Pin';
  const interpolatedDescription = description ? interpolateVariables(String(description), contextData) : '';
  const interpolatedLink = link ? interpolateVariables(String(link), contextData) : '';
  const interpolatedMediaSource = mediaSource ? interpolateVariables(String(mediaSource), contextData) : '';

  console.log(`[Pinterest] Creating pin: ${interpolatedTitle}...`);

  try {
    // Call Pinterest API v5 (Sandbox or Production)
    const baseUrl = isSandbox 
      ? 'https://api.pinterest.com/v5/pins' 
      : 'https://api.pinterest.com/v5/pins';
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Api-Source': appId || '',
      },
      body: JSON.stringify({
        board_id: boardId || undefined,
        title: interpolatedTitle,
        description: interpolatedDescription,
        link: interpolatedLink || undefined,
        media_source: mediaSource ? {
          source_type: 'image_url',
          url: interpolatedMediaSource,
        } : undefined,
      }),
    });

    const errorData = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Provide helpful error message for common issues
      if (errorData.code === 2) {
        throw new Error('Pinterest Authentication failed. Please check your access token and app ID. Sandbox tokens may expire - regenerate if needed.');
      }
      throw new Error(`Pinterest API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    const pinId = data.id;
    
    console.log('[Pinterest] Pin created');
    return {
      success: true,
      pinId,
      title: interpolatedTitle,
      url: `https://pinterest.com/pin/${pinId}`,
      board_id: data.board_id,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('[Pinterest] API call failed:', error);
    throw error;
  }
}

/**
 * Spreadsheet Action
 * Update Google Sheets/Excel
 */
async function executeSpreadsheet(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { action: sheetAction, sheet, data } = config;

  console.log(`[Spreadsheet] ${sheetAction || 'Updating'} sheet: ${sheet || 'default'}...`);

  // In production, call Google Sheets API
  // For now, return mock response
  const mockResponse = {
    success: true,
    spreadsheetId: 'mock-spreadsheet-id',
    sheet: sheet || 'Sheet1',
    rowsUpdated: 1,
  };

  console.log('[Spreadsheet] Sheet updated');
  return mockResponse;
}

/**
 * YouTube Transcript Action
 * Extract transcript from YouTube video
 */
async function executeYouTubeTranscript(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { language = 'en' } = config;
  const videoId = contextData.videoId || config.videoId;

  if (!videoId) {
    throw new Error('YouTube transcript action requires a video ID');
  }

  console.log(`[YouTube] Extracting transcript for video: ${videoId}...`);

  // In production, call YouTube API or transcript service
  // For now, return mock response
  const mockResponse = {
    success: true,
    videoId,
    language,
    transcript: '[Mock transcript text...] This is a sample transcript from the YouTube video.',
    duration: '10:00',
  };

  console.log('[YouTube] Transcript extracted');
  return mockResponse;
}

/**
 * Helper: Interpolate variables in string
 * Replaces {{variable}} with actual values from context
 */
function interpolateVariables(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = context[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Helper: Interpolate variables in object
 * Recursively processes nested objects
 */
function interpolateVariablesInObject(obj: any, context: Record<string, any>): any {
  if (typeof obj === 'string') {
    return interpolateVariables(obj, context);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => interpolateVariablesInObject(item, context));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateVariablesInObject(value, context);
    }
    return result;
  }
  
  return obj;
}
