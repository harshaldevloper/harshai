import { test, expect } from '@playwright/test';
import { testWorkflows, testNodes, testConnections } from '../fixtures/test-data';

test.describe('Workflow Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test.user@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('create new workflow from scratch', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click create workflow
    await page.click('[data-testid="create-workflow"]');
    await expect(page).toHaveURL(/\/workflows\/new/);
    
    // Fill workflow details
    await page.fill('[name="workflow-name"]', testWorkflows.simpleWebhook.name);
    await page.fill('[name="workflow-description"]', testWorkflows.simpleWebhook.description);
    
    // Save draft
    await page.click('[data-testid="save-draft"]');
    
    await expect(page.locator('[data-testid="workflow-saved"]')).toBeVisible();
  });

  test('add trigger node to workflow', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Add trigger
    await page.click('[data-testid="add-trigger"]');
    await page.selectOption('[data-testid="trigger-type"]', 'webhook');
    
    // Configure trigger
    await page.fill('[name="webhook-path"]', '/webhook/test');
    await page.selectOption('[name="webhook-method"]', 'POST');
    
    await page.click('[data-testid="save-trigger"]');
    
    await expect(page.locator('[data-testid="node-webhook"]')).toBeVisible();
  });

  test('add action node to workflow', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Add action
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-type"]', 'email');
    
    // Configure action
    await page.fill('[name="email-to"]', 'test@example.com');
    await page.fill('[name="email-subject"]', 'Test Subject');
    await page.fill('[name="email-body"]', 'Test body content');
    
    await page.click('[data-testid="save-action"]');
    
    await expect(page.locator('[data-testid="node-email"]')).toBeVisible();
  });

  test('connect nodes in workflow builder', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Add trigger node
    await page.click('[data-testid="add-trigger"]');
    await page.selectOption('[data-testid="trigger-type"]', 'webhook');
    await page.click('[data-testid="save-trigger"]');
    
    // Add action node
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-type"]', 'email');
    await page.click('[data-testid="save-action"]');
    
    // Connect nodes (drag from trigger to action)
    const triggerHandle = page.locator('[data-testid="node-webhook"] [data-handle="source"]');
    const emailHandle = page.locator('[data-testid="node-email"] [data-handle="target"]');
    
    await triggerHandle.dragTo(emailHandle);
    
    await expect(page.locator('[data-testid="connection"]')).toBeVisible();
  });

  test('save and publish workflow', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Create simple workflow
    await page.fill('[name="workflow-name"]', 'Published Workflow');
    
    await page.click('[data-testid="add-trigger"]');
    await page.selectOption('[data-testid="trigger-type"]', 'webhook');
    await page.click('[data-testid="save-trigger"]');
    
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-type"]', 'email');
    await page.click('[data-testid="save-action"]');
    
    // Publish
    await page.click('[data-testid="publish-workflow"]');
    
    await expect(page.locator('[data-testid="workflow-published"]')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-status"]')).toHaveText('Active');
  });

  test('load workflow from template', async ({ page }) => {
    await page.goto('/templates');
    
    // Select template
    await page.click('[data-testid="template-daily-report"]');
    await page.click('[data-testid="use-template"]');
    
    await expect(page).toHaveURL(/\/workflows\/new/);
    await expect(page.locator('[data-testid="workflow-nodes"]')).toHaveCount({ min: 2 });
  });

  test('delete node from workflow', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Add and then delete a node
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-type"]', 'email');
    await page.click('[data-testid="save-action"]');
    
    // Delete node
    await page.locator('[data-testid="node-email"] [data-testid="delete-node"]').click();
    
    await expect(page.locator('[data-testid="node-email"]')).not.toBeVisible();
  });

  test('duplicate workflow', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find existing workflow
    await page.click('[data-testid="workflow-options"]');
    await page.click('[data-testid="duplicate-workflow"]');
    
    await expect(page.locator('[data-testid="workflow-duplicated"]')).toBeVisible();
  });

  test('workflow validation before publish', async ({ page }) => {
    await page.goto('/workflows/new');
    
    // Try to publish without trigger
    await page.click('[data-testid="publish-workflow"]');
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('Workflow must have a trigger');
  });

  test('test workflow execution manually', async ({ page }) => {
    await page.goto('/workflows/1');
    
    // Click test button
    await page.click('[data-testid="test-workflow"]');
    
    // Fill test data
    await page.fill('[name="test-data"]', JSON.stringify({ test: 'data' }));
    await page.click('[data-testid="run-test"]');
    
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-status"]')).toHaveText('Success');
  });
});
