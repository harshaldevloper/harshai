import { test, expect } from '@playwright/test';
import { generateTestEmail, testUsers } from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can sign up with email and password', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'SecurePass123!';
    const testName = 'Test User';

    // Navigate to signup
    await page.click('[data-testid="signup-button"]');
    
    // Fill signup form
    await page.fill('[name="name"]', testName);
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', testPassword);
    
    // Submit form
    await page.click('[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText(testName);
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    
    await page.fill('[name="email"]', testUsers.valid.email);
    await page.fill('[name="password"]', testUsers.valid.password);
    
    await page.click('[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('login fails with invalid credentials', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    await page.click('[type="submit"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('password requirements are validated', async ({ page }) => {
    await page.click('[data-testid="signup-button"]');
    
    const testEmail = generateTestEmail();
    
    // Try weak password
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', 'weak');
    
    await page.click('[type="submit"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
  });

  test('email format is validated', async ({ page }) => {
    await page.click('[data-testid="signup-button"]');
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', 'SecurePass123!');
    
    await page.click('[type="submit"]');
    
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-button"]');
    await page.fill('[name="email"]', testUsers.valid.email);
    await page.fill('[name="password"]', testUsers.valid.password);
    await page.click('[type="submit"]');
    
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/\/login/);
  });

  test('password reset flow', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.click('[data-testid="forgot-password"]');
    
    await expect(page).toHaveURL(/\/reset-password/);
    
    const testEmail = generateTestEmail();
    await page.fill('[name="email"]', testEmail);
    await page.click('[type="submit"]');
    
    await expect(page.locator('[data-testid="reset-sent-message"]')).toBeVisible();
  });
});
