import { test, expect } from '@playwright/test';

test.describe('User Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test.user@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('dashboard displays workflow count', async ({ page }) => {
    await expect(page.locator('[data-testid="workflow-count"]')).toBeVisible();
  });

  test('dashboard shows recent executions', async ({ page }) => {
    await expect(page.locator('[data-testid="recent-executions"]')).toBeVisible();
  });

  test('dashboard displays usage statistics', async ({ page }) => {
    await expect(page.locator('[data-testid="usage-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="executions-used"]')).toBeVisible();
    await expect(page.locator('[data-testid="executions-limit"]')).toBeVisible();
  });

  test('create workflow button is visible', async ({ page }) => {
    await expect(page.locator('[data-testid="create-workflow"]')).toBeVisible();
  });

  test('workflow list displays existing workflows', async ({ page }) => {
    await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible();
  });

  test('can navigate to workflow editor', async ({ page }) => {
    await page.click('[data-testid="create-workflow"]');
    await expect(page).toHaveURL(/\/workflows\/new/);
  });

  test('can view workflow details', async ({ page }) => {
    await page.click('[data-testid="workflow-item"]:first-child');
    await expect(page).toHaveURL(/\/workflows\/\d+/);
  });

  test('can access settings page', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="settings-link"]');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('can access billing page', async ({ page }) => {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="billing-link"]');
    await expect(page).toHaveURL(/\/billing/);
  });

  test('notifications are displayed', async ({ page }) => {
    await expect(page.locator('[data-testid="notifications"]')).toBeVisible();
  });

  test('search workflows functionality', async ({ page }) => {
    await page.fill('[data-testid="search-workflows"]', 'test');
    await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible();
  });

  test('filter workflows by status', async ({ page }) => {
    await page.selectOption('[data-testid="filter-status"]', 'active');
    await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible();
  });

  test('sort workflows by date', async ({ page }) => {
    await page.selectOption('[data-testid="sort-by"]', 'created_at');
    await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible();
  });

  test('pagination works for workflow list', async ({ page }) => {
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test('quick actions menu is available', async ({ page }) => {
    await page.click('[data-testid="workflow-options"]:first-child');
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
  });

  test('can duplicate workflow from dashboard', async ({ page }) => {
    await page.click('[data-testid="workflow-options"]:first-child');
    await page.click('[data-testid="duplicate-workflow"]');
    await expect(page.locator('[data-testid="workflow-duplicated"]')).toBeVisible();
  });

  test('can delete workflow from dashboard', async ({ page }) => {
    await page.click('[data-testid="workflow-options"]:first-child');
    await page.click('[data-testid="delete-workflow"]');
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator('[data-testid="workflow-deleted"]')).toBeVisible();
  });

  test('dashboard loads quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 second load time target
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible();
  });
});
