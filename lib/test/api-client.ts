/**
 * API Testing Client for Integration Tests
 * 
 * Usage:
 * ```typescript
 * const client = new APIClient('http://localhost:3000', authToken);
 * const workflows = await client.get('/api/workflows');
 * ```
 */

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export class APIClient {
  private baseURL: string;
  private token?: string;
  private defaultTimeout: number;

  constructor(baseURL: string, token?: string, timeoutMs: number = 10000) {
    this.baseURL = baseURL;
    this.token = token;
    this.defaultTimeout = timeoutMs;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = undefined;
  }

  /**
   * Make HTTP request
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T>(
    endpoint: string,
    file: File | Blob,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    const headers: HeadersInit = {
      ...options?.headers,
    };
    // Don't set Content-Type for multipart/form-data - browser will set it with boundary

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: file,
    });
  }

  /**
   * Download file
   */
  async download(
    endpoint: string,
    options?: RequestOptions
  ): Promise<Blob> {
    const response = await this.request<Blob>(endpoint, {
      ...options,
      method: 'GET',
    });

    return response.data;
  }

  /**
   * Wait for condition to be true with polling
   */
  async waitFor(
    condition: () => Promise<boolean>,
    timeoutMs: number = 10000,
    intervalMs: number = 500
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`Condition not met within ${timeoutMs}ms`);
  }

  /**
   * Retry failed request
   */
  async retry<T>(
    endpoint: string,
    options: RequestOptions = {},
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<APIResponse<T>> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.request<T>(endpoint, options);
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }
}

/**
 * Create authenticated API client
 */
export async function createAuthenticatedClient(
  baseURL: string,
  email: string,
  password: string
): Promise<APIClient> {
  const client = new APIClient(baseURL);
  
  const response = await client.post<{ token: string }>('/api/auth/login', {
    email,
    password,
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  client.setToken(response.data.token);
  
  return client;
}

/**
 * API endpoint helpers
 */
export const endpoints = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify',
    resetPassword: '/api/auth/reset-password',
  },
  workflows: {
    list: '/api/workflows',
    create: '/api/workflows',
    get: (id: string) => `/api/workflows/${id}`,
    update: (id: string) => `/api/workflows/${id}`,
    delete: (id: string) => `/api/workflows/${id}`,
    execute: (id: string) => `/api/workflows/${id}/execute`,
    duplicate: (id: string) => `/api/workflows/${id}/duplicate`,
    templates: '/api/workflows/templates',
  },
  executions: {
    list: '/api/executions',
    get: (id: string) => `/api/executions/${id}`,
    cancel: (id: string) => `/api/executions/${id}/cancel`,
    logs: (id: string) => `/api/executions/${id}/logs`,
  },
  user: {
    profile: '/api/user/profile',
    update: '/api/user/profile',
    settings: '/api/user/settings',
    usage: '/api/user/usage',
    billing: '/api/user/billing',
  },
  integrations: {
    list: '/api/integrations',
    connect: (provider: string) => `/api/integrations/${provider}/connect`,
    disconnect: (provider: string) => `/api/integrations/${provider}/disconnect`,
  },
  webhooks: {
    list: '/api/webhooks',
    create: '/api/webhooks',
    test: '/api/webhooks/test',
  },
};
