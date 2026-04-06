import { expect } from '@playwright/test';

/**
 * Global test setup and teardown
 */

// Extend expect with custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global setup
export async function setup() {
  console.log('🧪 Starting test suite...');
  
  // Clear test database
  // await clearTestDatabase();
}

// Global teardown
export async function teardown() {
  console.log('🏁 Test suite completed');
  
  // Cleanup test artifacts
  // await cleanupTestArtifacts();
}

// Helper: Wait for element to be stable
export async function waitForStable(page, selector, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.waitForTimeout(300); // Wait for animations
}

// Helper: Generate unique test email
export function generateTestEmail() {
  return `test_${Date.now()}@example.com`;
}

// Helper: Generate unique test name
export function generateTestName(prefix = 'Test') {
  return `${prefix}_${Date.now()}`;
}
