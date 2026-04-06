/**
 * API Client Utility
 * Generic API call executor with response parsing and field mapping
 */

import { z } from 'zod';

export interface ApiCallConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  auth?: {
    type: 'oauth' | 'api-key' | 'bearer' | 'basic' | 'none';
    token?: string;
    apiKey?: string;
    apiKeyName?: string;
    apiKeyLocation?: 'header' | 'query';
    username?: string;
    password?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: {
    type: 'json' | 'form-data' | 'raw';
    content: string;
  };
  timeout?: number;
  parseResponse?: boolean;
  outputMapping?: Record<string, string>;
  retryCount?: number;
}

export interface ApiCallResult {
  status: number;
  headers: Record<string, string>;
  data: any;
  output?: Record<string, any>;
  duration: number;
}

/**
 * Make an API call with configuration
 */
export async function makeApiCall(config: ApiCallConfig): Promise<ApiCallResult> {
  const startTime = Date.now();
  
  // Build URL with query params
  const url = buildUrl(config.url, config.queryParams);
  
  // Build headers
  const headers = buildHeaders(config);
  
  // Build body
  const body = buildBody(config);
  
  // Make request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);
  
  let response: Response;
  let attempts = 0;
  const maxAttempts = (config.retryCount || 0) + 1;
  
  do {
    try {
      response = await fetch(url, {
        method: config.method,
        headers,
        body,
        signal: controller.signal,
      });
      break;
    } catch (error: any) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  } while (attempts < maxAttempts);
  
  clearTimeout(timeoutId);
  
  // Get headers as object
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
  
  // Parse response
  let data: any;
  if (config.parseResponse !== false) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('application/xml')) {
      data = await parseXml(await response.text());
    } else {
      data = await response.text();
    }
  } else {
    data = await response.text();
  }
  
  // Map output fields
  const output = config.outputMapping ? mapFields(data, config.outputMapping) : undefined;
  
  return {
    status: response.status,
    headers: responseHeaders,
    data,
    output,
    duration: Date.now() - startTime,
  };
}

/**
 * Build URL with query parameters
 */
export function buildUrl(url: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, value);
  });
  return urlObj.toString();
}

/**
 * Build headers with authentication
 */
function buildHeaders(config: ApiCallConfig): Record<string, string> {
  const headers: Record<string, string> = {
    ...config.headers,
  };
  
  // Add auth headers
  if (config.auth) {
    switch (config.auth.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${config.auth.token}`;
        break;
      case 'api-key':
        if (config.auth.apiKeyLocation === 'header') {
          headers[config.auth.apiKeyName || 'X-API-Key'] = config.auth.apiKey!;
        }
        break;
      case 'basic':
        const credentials = Buffer.from(
          `${config.auth.username}:${config.auth.password}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
    }
  }
  
  // Set content type based on body type
  if (config.body) {
    if (config.body.type === 'json' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    } else if (config.body.type === 'form-data' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }
  
  return headers;
}

/**
 * Build request body
 */
function buildBody(config: ApiCallConfig): string | FormData | undefined {
  if (!config.body) {
    return undefined;
  }
  
  switch (config.body.type) {
    case 'json':
      return config.body.content;
    case 'form-data':
      const formData = new FormData();
      const params = new URLSearchParams(config.body.content);
      params.forEach((value, key) => {
        formData.append(key, value);
      });
      return formData;
    case 'raw':
      return config.body.content;
    default:
      return undefined;
  }
}

/**
 * Map fields from source object using dot notation paths
 */
export function mapFields(
  source: any,
  mapping: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(mapping).forEach(([destKey, sourcePath]) => {
    const value = getValueByPath(source, sourcePath);
    if (value !== undefined) {
      result[destKey] = value;
    }
  });
  
  return result;
}

/**
 * Get value from object using dot notation path
 */
export function getValueByPath(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Handle array access
    const arrayMatch = key.match(/^(.*)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      current = current[arrayKey || '']?.[parseInt(index, 10)];
    } else {
      current = current[key];
    }
  }
  
  return current;
}

/**
 * Parse XML string to object
 */
async function parseXml(xml: string): Promise<any> {
  // Simple XML parser - in production, use a proper library like fast-xml-parser
  const result: any = {};
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  let match;
  
  while ((match = tagRegex.exec(xml)) !== null) {
    const [, tagName, attrs, content] = match;
    const attrObj: any = {};
    
    // Parse attributes
    const attrRegex = /(\w+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      attrObj[attrMatch[1]] = attrMatch[2];
    }
    
    // Check for nested content
    if (content.trim().startsWith('<')) {
      attrObj._content = await parseXml(content);
    } else {
      attrObj._text = content.trim();
    }
    
    result[tagName] = attrObj;
  }
  
  return result;
}

/**
 * Validate response status code
 */
export function validateResponse(
  response: { status: number },
  validStatuses?: number[]
): void {
  const valid = validStatuses || [200, 201, 204];
  if (!valid.includes(response.status)) {
    throw new Error(`Invalid response status: ${response.status}`);
  }
}

/**
 * Extract value from JSON path
 * Supports: data.user.name, data.items[0].id, etc.
 */
export function extractJsonPath(obj: any, path: string): any {
  return getValueByPath(obj, path);
}
