/**
 * Shared test fixtures and test data generators
 */

export const testUsers = {
  valid: {
    email: 'test.user@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    name: 'Admin User',
    role: 'admin',
  },
  free: {
    email: 'free.user@example.com',
    password: 'FreePass123!',
    name: 'Free User',
    plan: 'free',
  },
  pro: {
    email: 'pro.user@example.com',
    password: 'ProPass123!',
    name: 'Pro User',
    plan: 'pro',
  },
};

export const testWorkflows = {
  simpleWebhook: {
    name: 'Simple Webhook Workflow',
    description: 'A basic webhook-triggered workflow',
    trigger: {
      type: 'webhook',
      config: {
        method: 'POST',
        path: '/webhook/test',
      },
    },
    actions: [
      {
        type: 'email',
        config: {
          to: '{{webhook.email}}',
          subject: 'Webhook Received',
          body: 'Your webhook was processed successfully!',
        },
      },
    ],
  },
  scheduledTask: {
    name: 'Daily Report Generator',
    description: 'Generates and sends daily reports',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 9 * * *', // Every day at 9 AM
        timezone: 'UTC',
      },
    },
    actions: [
      {
        type: 'http',
        config: {
          url: 'https://api.example.com/data',
          method: 'GET',
        },
      },
      {
        type: 'email',
        config: {
          to: 'user@example.com',
          subject: 'Daily Report',
          body: '{{http_response.data}}',
        },
      },
    ],
  },
  multiStepAI: {
    name: 'AI Content Generator',
    description: 'Generates content using AI',
    trigger: {
      type: 'webhook',
      config: {
        method: 'POST',
        path: '/webhook/generate',
      },
    },
    actions: [
      {
        type: 'openai',
        config: {
          model: 'gpt-4',
          prompt: '{{webhook.topic}}',
          max_tokens: 1000,
        },
      },
      {
        type: 'slack',
        config: {
          channel: '#content',
          text: '{{openai_response.choices[0].text}}',
        },
      },
    ],
  },
};

export const testNodes = {
  webhookTrigger: {
    id: 'node_1',
    type: 'trigger',
    nodeType: 'webhook',
    position: { x: 100, y: 100 },
    data: {
      label: 'Webhook Trigger',
      config: {
        method: 'POST',
        path: '/webhook/test',
      },
    },
  },
  emailAction: {
    id: 'node_2',
    type: 'action',
    nodeType: 'email',
    position: { x: 400, y: 100 },
    data: {
      label: 'Send Email',
      config: {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      },
    },
  },
  conditionNode: {
    id: 'node_3',
    type: 'condition',
    nodeType: 'if',
    position: { x: 250, y: 200 },
    data: {
      label: 'Check Condition',
      config: {
        condition: '{{webhook.value}} > 10',
        truePath: 'node_2',
        falsePath: 'node_4',
      },
    },
  },
};

export const testConnections = [
  {
    id: 'conn_1',
    source: 'node_1',
    sourceHandle: 'source',
    target: 'node_2',
    targetHandle: 'target',
  },
];

export const testOAuthConfigs = {
  google: {
    clientId: 'test-google-client-id.apps.googleusercontent.com',
    clientSecret: 'test-google-secret',
    redirectUri: 'http://localhost:3000/api/auth/callback/google',
  },
  github: {
    clientId: 'test-github-client-id',
    clientSecret: 'test-github-secret',
    redirectUri: 'http://localhost:3000/api/auth/callback/github',
  },
};

export const testWebhooks = {
  stripe: {
    event: 'payment_intent.succeeded',
    data: {
      id: 'pi_test123',
      amount: 9900,
      currency: 'usd',
      customer: 'cus_test123',
    },
  },
  github: {
    event: 'push',
    data: {
      ref: 'refs/heads/main',
      repository: {
        name: 'test-repo',
        full_name: 'user/test-repo',
      },
      commits: [
        {
          id: 'abc123',
          message: 'Test commit',
          author: {
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ],
    },
  },
};

export const apiEndpoints = {
  auth: {
    signup: '/api/auth/signup',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    verify: '/api/auth/verify',
  },
  workflows: {
    list: '/api/workflows',
    create: '/api/workflows',
    get: (id: string) => `/api/workflows/${id}`,
    update: (id: string) => `/api/workflows/${id}`,
    delete: (id: string) => `/api/workflows/${id}`,
    execute: (id: string) => `/api/workflows/${id}/execute`,
  },
  executions: {
    list: '/api/executions',
    get: (id: string) => `/api/executions/${id}`,
  },
  user: {
    profile: '/api/user/profile',
    settings: '/api/user/settings',
    usage: '/api/user/usage',
  },
};

/**
 * Generate random string for unique test data
 */
export function randomString(length = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate unique test email
 */
export function generateTestEmail(): string {
  return `test_${Date.now()}_${randomString(5)}@example.com`;
}

/**
 * Generate unique test name
 */
export function generateTestName(prefix = 'Test'): string {
  return `${prefix}_${Date.now()}_${randomString(5)}`;
}
