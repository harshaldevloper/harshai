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
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}

/**
 * ChatGPT Action
 * Send prompt to OpenAI and get response
 */
async function executeChatGPT(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { prompt, model = 'gpt-4' } = config;

  if (!prompt) {
    throw new Error('ChatGPT action requires a prompt');
  }

  // Interpolate context variables into prompt
  const interpolatedPrompt = interpolateVariables(prompt, contextData);

  console.log(`[ChatGPT] Sending prompt to ${model}...`);

  // In production, call OpenAI API here
  // For now, return mock response
  const mockResponse = {
    content: `[Mock ChatGPT Response] Processed: "${interpolatedPrompt.substring(0, 50)}..."`,
    model,
    usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
  };

  console.log('[ChatGPT] Response received');
  return mockResponse;
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

  // In production, make actual HTTP request
  // For now, return mock response
  const mockResponse = {
    status: 200,
    data: { success: true, message: 'Webhook received' },
    url,
    method,
  };

  console.log('[Webhook] Response received');
  return mockResponse;
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
  const interpolatedSubject = subject ? interpolateVariables(subject, contextData) : 'No Subject';
  const interpolatedBody = emailBody ? interpolateVariables(emailBody, contextData) : '';

  console.log(`[Gmail] Sending email to ${to}...`);

  // In production, call Gmail API
  // For now, return mock response
  const mockResponse = {
    success: true,
    messageId: `mock-${Date.now()}`,
    to,
    subject: interpolatedSubject,
  };

  console.log('[Gmail] Email sent');
  return mockResponse;
}

/**
 * Twitter/X Action
 * Post tweet via Twitter API
 */
async function executeTwitter(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { action: twitterAction, content } = config;

  if (!content) {
    throw new Error('Twitter action requires content');
  }

  const interpolatedContent = interpolateVariables(content, contextData);

  console.log(`[Twitter] Posting: "${interpolatedContent.substring(0, 50)}..."`);

  // In production, call Twitter API
  // For now, return mock response
  const mockResponse = {
    success: true,
    tweetId: `mock-tweet-${Date.now()}`,
    url: 'https://twitter.com/user/status/mock',
    content: interpolatedContent,
  };

  console.log('[Twitter] Tweet posted');
  return mockResponse;
}

/**
 * Notion Action
 * Create/update page in Notion
 */
async function executeNotion(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { action: notionAction, database, title, content } = config;

  console.log(`[Notion] ${notionAction || 'Creating'} page in ${database || 'default'}...`);

  // In production, call Notion API
  // For now, return mock response
  const mockResponse = {
    success: true,
    pageId: `mock-page-${Date.now()}`,
    url: `https://notion.so/mock-page-${Date.now()}`,
    action: notionAction || 'create',
  };

  console.log('[Notion] Page created/updated');
  return mockResponse;
}

/**
 * Slack Action
 * Send message to Slack channel
 */
async function executeSlack(config: ActionConfig, contextData: Record<string, any>): Promise<any> {
  const { channel, message, action: slackAction } = config;

  if (!channel) {
    throw new Error('Slack action requires a channel');
  }

  const interpolatedMessage = message ? interpolateVariables(message, contextData) : 'No message';

  console.log(`[Slack] Sending to #${channel}...`);

  // In production, call Slack API
  // For now, return mock response
  const mockResponse = {
    success: true,
    ts: `${Date.now()}.mock`,
    channel,
    message: interpolatedMessage,
  };

  console.log('[Slack] Message sent');
  return mockResponse;
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
