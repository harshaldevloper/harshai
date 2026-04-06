import { test, expect } from '@playwright/test';
import { apiEndpoints, testWorkflows, generateTestEmail } from '../fixtures/test-data';

test.describe('API Integration', () => {
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // Login and get auth token
    const loginResponse = await request.post(apiEndpoints.auth.login, {
      data: {
        email: 'test.user@example.com',
        password: 'SecurePass123!',
      },
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('GET /api/workflows returns user workflows', async ({ request }) => {
    const response = await request.get(apiEndpoints.workflows.list, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data.workflows)).toBeTruthy();
  });

  test('POST /api/workflows creates new workflow', async ({ request }) => {
    const workflowData = {
      name: generateTestName('API Test Workflow'),
      description: 'Created via API test',
      trigger: {
        type: 'webhook',
        config: { method: 'POST', path: '/webhook/test' },
      },
      actions: [],
    };

    const response = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: workflowData,
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.workflow.id).toBeDefined();
    expect(data.workflow.name).toBe(workflowData.name);
  });

  test('GET /api/workflows/:id returns workflow details', async ({ request }) => {
    // First create a workflow
    const createResponse = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: generateTestName('Test'),
        description: 'Test workflow',
        trigger: { type: 'webhook', config: { method: 'POST', path: '/test' } },
        actions: [],
      },
    });
    
    const created = await createResponse.json();
    const workflowId = created.workflow.id;
    
    // Get workflow details
    const getResponse = await request.get(apiEndpoints.workflows.get(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(getResponse.ok()).toBeTruthy();
    const data = await getResponse.json();
    expect(data.workflow.id).toBe(workflowId);
  });

  test('PUT /api/workflows/:id updates workflow', async ({ request }) => {
    // Create workflow
    const createResponse = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: generateTestName('Original'),
        description: 'Original description',
        trigger: { type: 'webhook', config: { method: 'POST', path: '/test' } },
        actions: [],
      },
    });
    
    const created = await createResponse.json();
    const workflowId = created.workflow.id;
    
    // Update workflow
    const updateResponse = await request.put(apiEndpoints.workflows.update(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: 'Updated Name',
        description: 'Updated description',
      },
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const data = await updateResponse.json();
    expect(data.workflow.name).toBe('Updated Name');
    expect(data.workflow.description).toBe('Updated description');
  });

  test('DELETE /api/workflows/:id removes workflow', async ({ request }) => {
    // Create workflow
    const createResponse = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: generateTestName('To Delete'),
        description: 'Will be deleted',
        trigger: { type: 'webhook', config: { method: 'POST', path: '/test' } },
        actions: [],
      },
    });
    
    const created = await createResponse.json();
    const workflowId = created.workflow.id;
    
    // Delete workflow
    const deleteResponse = await request.delete(apiEndpoints.workflows.delete(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(deleteResponse.ok()).toBeTruthy();
    
    // Verify deletion
    const getResponse = await request.get(apiEndpoints.workflows.get(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(getResponse.status()).toBe(404);
  });

  test('POST /api/workflows/:id/execute triggers workflow', async ({ request }) => {
    // Create workflow
    const createResponse = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: generateTestName('Executable'),
        description: 'Test execution',
        trigger: { type: 'webhook', config: { method: 'POST', path: '/test' } },
        actions: [],
      },
    });
    
    const created = await createResponse.json();
    const workflowId = created.workflow.id;
    
    // Execute workflow
    const executeResponse = await request.post(apiEndpoints.workflows.execute(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        inputData: { test: 'data' },
      },
    });
    
    expect(executeResponse.ok()).toBeTruthy();
    const data = await executeResponse.json();
    expect(data.execution.id).toBeDefined();
    expect(data.execution.status).toBe('running');
  });

  test('GET /api/executions/:id returns execution details', async ({ request }) => {
    // Create and execute workflow
    const createResponse = await request.post(apiEndpoints.workflows.create, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        name: generateTestName('Exec Test'),
        description: 'Test',
        trigger: { type: 'webhook', config: { method: 'POST', path: '/test' } },
        actions: [],
      },
    });
    
    const created = await createResponse.json();
    const workflowId = created.workflow.id;
    
    const executeResponse = await request.post(apiEndpoints.workflows.execute(workflowId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      data: { inputData: {} },
    });
    
    const executed = await executeResponse.json();
    const executionId = executed.execution.id;
    
    // Get execution details
    const getResponse = await request.get(apiEndpoints.executions.get(executionId), {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(getResponse.ok()).toBeTruthy();
    const data = await getResponse.json();
    expect(data.execution.id).toBe(executionId);
  });

  test('GET /api/user/profile returns user profile', async ({ request }) => {
    const response = await request.get(apiEndpoints.user.profile, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.user.email).toBe('test.user@example.com');
  });

  test('GET /api/user/usage returns usage statistics', async ({ request }) => {
    const response = await request.get(apiEndpoints.user.usage, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.usage).toBeDefined();
    expect(data.usage.workflowsCount).toBeDefined();
    expect(data.usage.executionsCount).toBeDefined();
  });

  test('unauthorized requests return 401', async ({ request }) => {
    const response = await request.get(apiEndpoints.workflows.list, {
      headers: {
        'Authorization': 'Bearer invalid_token',
      },
    });
    
    expect(response.status()).toBe(401);
  });

  test('rate limiting is enforced', async ({ request }) => {
    // Make multiple rapid requests
    const requests = [];
    for (let i = 0; i < 20; i++) {
      requests.push(
        request.get(apiEndpoints.workflows.list, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    // Should have at least one 429 response
    expect(statusCodes).toContain(429);
  });
});
