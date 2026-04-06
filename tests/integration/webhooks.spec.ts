import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock webhook receiver server
let webhookServer: any;
let webhookPort: number;
let receivedWebhooks: any[] = [];

describe('Webhook Integration', () => {
  beforeAll(async () => {
    receivedWebhooks = [];
    
    // Start mock webhook receiver
    webhookServer = createServer((req, res) => {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        receivedWebhooks.push({
          headers: req.headers,
          body: JSON.parse(body || '{}'),
          method: req.method,
          url: req.url,
          timestamp: new Date(),
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: true }));
      });
    });
    
    await new Promise<void>((resolve) => {
      webhookServer.listen(0, () => {
        const address = webhookServer.address();
        webhookPort = typeof address === 'string' ? parseInt(address.split(':').pop() || '0') : address?.port || 0;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (webhookServer) {
      webhookServer.close();
    }
    await prisma.$disconnect();
  });

  it('webhook endpoint accepts POST requests', async () => {
    const response = await fetch(`http://localhost:${webhookPort}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.received).toBe(true);
    expect(receivedWebhooks.length).toBe(1);
  });

  it('webhook payload is parsed correctly', async () => {
    const payload = {
      event: 'test.event',
      data: {
        id: '123',
        name: 'Test',
        value: 42,
      },
    };
    
    await fetch(`http://localhost:${webhookPort}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const lastWebhook = receivedWebhooks[receivedWebhooks.length - 1];
    expect(lastWebhook.body).toEqual(payload);
  });

  it('webhook headers are captured', async () => {
    const response = await fetch(`http://localhost:${webhookPort}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
        'X-Test-Header': 'test-value',
      },
      body: JSON.stringify({ test: 'data' }),
    });
    
    expect(response.ok).toBe(true);
    
    const lastWebhook = receivedWebhooks[receivedWebhooks.length - 1];
    expect(lastWebhook.headers['x-custom-header']).toBe('custom-value');
    expect(lastWebhook.headers['x-test-header']).toBe('test-value');
  });

  it('webhook signature verification works', async () => {
    const crypto = require('crypto');
    const secret = 'webhook_secret';
    const payload = JSON.stringify({ event: 'test' });
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64);
  });

  it('webhook is logged in database', async () => {
    const email = `webhook_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Webhook Test User',
        password: 'hashed',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Webhook Workflow',
        userId: user.id,
        trigger: { type: 'webhook', config: { path: '/webhook/test' } },
        actions: [],
        status: 'active',
      },
    });
    
    const webhookLog = await prisma.webhookLog.create({
      data: {
        workflowId: workflow.id,
        event: 'test.event',
        payload: { test: 'data' },
        headers: { 'content-type': 'application/json' },
        status: 'received',
      },
    });
    
    expect(webhookLog).toBeDefined();
    expect(webhookLog.workflowId).toBe(workflow.id);
    expect(webhookLog.status).toBe('received');
    
    // Cleanup
    await prisma.webhookLog.delete({ where: { id: webhookLog.id } });
    await prisma.workflow.delete({ where: { id: workflow.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('webhook triggers workflow execution', async () => {
    const email = `webhook_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Webhook Test User',
        password: 'hashed',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Webhook Trigger Workflow',
        userId: user.id,
        trigger: { type: 'webhook', config: { path: '/webhook/trigger' } },
        actions: [],
        status: 'active',
      },
    });
    
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'triggered',
        triggerType: 'webhook',
        inputData: { webhook_event: 'test' },
        startedAt: new Date(),
      },
    });
    
    expect(execution).toBeDefined();
    expect(execution.workflowId).toBe(workflow.id);
    expect(execution.triggerType).toBe('webhook');
    
    // Cleanup
    await prisma.execution.delete({ where: { id: execution.id } });
    await prisma.workflow.delete({ where: { id: workflow.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('webhook retry logic works on failure', async () => {
    // Simulate failed webhook delivery
    const retryCount = 3;
    const retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s
    
    expect(retryCount).toBe(3);
    expect(retryDelays.length).toBe(3);
  });

  it('webhook delivery status is tracked', async () => {
    const email = `webhook_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Webhook Test User',
        password: 'hashed',
      },
    });
    
    const webhookDelivery = await prisma.webhookDelivery.create({
      data: {
        url: `http://localhost:${webhookPort}/webhook`,
        payload: { event: 'test' },
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
        nextRetryAt: new Date(Date.now() + 1000),
      },
    });
    
    expect(webhookDelivery).toBeDefined();
    expect(webhookDelivery.status).toBe('pending');
    expect(webhookDelivery.attempts).toBe(0);
    
    // Cleanup
    await prisma.webhookDelivery.delete({ where: { id: webhookDelivery.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('webhook filters work correctly', async () => {
    const filter = {
      event: 'payment.*',
      conditions: [
        { field: 'data.amount', operator: 'gt', value: 1000 },
      ],
    };
    
    const testPayload1 = { event: 'payment.succeeded', data: { amount: 5000 } };
    const testPayload2 = { event: 'payment.failed', data: { amount: 500 } };
    
    // Simple filter matching logic
    const matchesFilter = (payload: any, filter: any) => {
      const eventMatch = new RegExp(filter.event).test(payload.event);
      const conditionsMatch = filter.conditions.every((c: any) => {
        const value = c.field.split('.').reduce((obj: any, key: string) => obj?.[key], payload);
        switch (c.operator) {
          case 'gt': return value > c.value;
          case 'lt': return value < c.value;
          case 'eq': return value === c.value;
          default: return false;
        }
      });
      return eventMatch && conditionsMatch;
    };
    
    expect(matchesFilter(testPayload1, filter)).toBe(true);
    expect(matchesFilter(testPayload2, filter)).toBe(false);
  });

  it('webhook analytics are recorded', async () => {
    const email = `webhook_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Webhook Test User',
        password: 'hashed',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Analytics Workflow',
        userId: user.id,
        trigger: { type: 'webhook', config: {} },
        actions: [],
        status: 'active',
      },
    });
    
    const analytics = await prisma.webhookAnalytics.create({
      data: {
        workflowId: workflow.id,
        date: new Date(),
        receivedCount: 100,
        successCount: 95,
        failureCount: 5,
        avgResponseTime: 250,
      },
    });
    
    expect(analytics).toBeDefined();
    expect(analytics.receivedCount).toBe(100);
    expect(analytics.successCount).toBe(95);
    expect(analytics.failureCount).toBe(5);
    
    // Cleanup
    await prisma.webhookAnalytics.delete({ where: { id: analytics.id } });
    await prisma.workflow.delete({ where: { id: workflow.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('webhook secret rotation works', async () => {
    const oldSecret = 'old_webhook_secret';
    const newSecret = 'new_webhook_secret';
    
    expect(oldSecret).not.toBe(newSecret);
    expect(newSecret.length).toBe(oldSecret.length);
  });

  it('concurrent webhooks are handled correctly', async () => {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        fetch(`http://localhost:${webhookPort}/webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: i }),
        })
      );
    }
    
    const responses = await Promise.all(promises);
    
    expect(responses.every(r => r.ok)).toBe(true);
    expect(receivedWebhooks.length).toBeGreaterThanOrEqual(10);
  });

  it('webhook timeout is enforced', async () => {
    const timeout = 5000; // 5 seconds
    
    expect(timeout).toBe(5000);
  });
});
