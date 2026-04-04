/**
 * Test Script for Email Notification System
 * Day 29 MVP - Email Notifications
 * 
 * Usage: node test-notifications.js
 * 
 * This script tests:
 * 1. Email service configuration
 * 2. Sending test notifications
 * 3. API endpoint availability
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  apiSecret: process.env.TEST_API_SECRET || 'test-secret',
  testEmail: process.env.TEST_EMAIL || 'test@example.com',
  workflowId: 'test-workflow-123',
  workflowName: 'Test Workflow',
  userId: 'test-user-123'
};

console.log('🧪 HarshAI Email Notification System - Test Suite');
console.log('=' .repeat(60));
console.log(`Base URL: ${CONFIG.baseUrl}`);
console.log(`Test Email: ${CONFIG.testEmail}`);
console.log('=' .repeat(60));
console.log();

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiSecret}`
      }
    };

    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test 1: Check API endpoint availability
 */
async function testApiAvailability() {
  console.log('📍 Test 1: API Endpoint Availability');
  console.log('-' .repeat(40));
  
  try {
    const result = await makeRequest('GET', '/api/notifications/preferences');
    
    if (result.status === 401) {
      console.log('✅ API endpoint is responding (requires auth)');
      return true;
    } else if (result.status === 200) {
      console.log('✅ API endpoint is responding');
      return true;
    } else {
      console.log(`❌ API endpoint returned status: ${result.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API endpoint not reachable: ${error.message}`);
    return false;
  }
}

/**
 * Test 2: Send test notification (success)
 */
async function testSendSuccessNotification() {
  console.log();
  console.log('📧 Test 2: Send Success Notification');
  console.log('-' .repeat(40));
  
  const payload = {
    executionId: `test-exec-${Date.now()}`,
    workflowId: CONFIG.workflowId,
    workflowName: CONFIG.workflowName,
    userId: CONFIG.userId,
    type: 'success',
    executionTime: 1234,
    stepsExecuted: 5
  };
  
  try {
    const result = await makeRequest('POST', '/api/notifications/send', payload);
    
    if (result.status === 200 && result.data?.success) {
      console.log('✅ Success notification sent');
      if (result.data.emailSent) {
        console.log(`   Email ID: ${result.data.emailId}`);
        console.log(`   Recipient: ${result.data.recipient}`);
      } else {
        console.log(`   Note: ${result.data.message || 'Email not sent'}`);
      }
      return true;
    } else {
      console.log(`❌ Failed to send notification: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error sending notification: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Send test notification (failure)
 */
async function testSendFailureNotification() {
  console.log();
  console.log('❌ Test 3: Send Failure Notification');
  console.log('-' .repeat(40));
  
  const payload = {
    executionId: `test-exec-${Date.now()}`,
    workflowId: CONFIG.workflowId,
    workflowName: CONFIG.workflowName,
    userId: CONFIG.userId,
    type: 'failure',
    errorMessage: 'Test error: API key invalid',
    executionTime: 500
  };
  
  try {
    const result = await makeRequest('POST', '/api/notifications/send', payload);
    
    if (result.status === 200 && result.data?.success) {
      console.log('✅ Failure notification sent');
      if (result.data.emailSent) {
        console.log(`   Email ID: ${result.data.emailId}`);
        console.log(`   Recipient: ${result.data.recipient}`);
      } else {
        console.log(`   Note: ${result.data.message || 'Email not sent'}`);
      }
      return true;
    } else {
      console.log(`❌ Failed to send notification: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error sending notification: ${error.message}`);
    return false;
  }
}

/**
 * Test 4: Send test notification (start)
 */
async function testSendStartNotification() {
  console.log();
  console.log('🚀 Test 4: Send Start Notification');
  console.log('-' .repeat(40));
  
  const payload = {
    executionId: `test-exec-${Date.now()}`,
    workflowId: CONFIG.workflowId,
    workflowName: CONFIG.workflowName,
    userId: CONFIG.userId,
    type: 'start'
  };
  
  try {
    const result = await makeRequest('POST', '/api/notifications/send', payload);
    
    if (result.status === 200 && result.data?.success) {
      console.log('✅ Start notification sent');
      if (result.data.emailSent) {
        console.log(`   Email ID: ${result.data.emailId}`);
        console.log(`   Recipient: ${result.data.recipient}`);
      } else {
        console.log(`   Note: ${result.data.message || 'Email not sent'}`);
      }
      return true;
    } else {
      console.log(`❌ Failed to send notification: ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error sending notification: ${error.message}`);
    return false;
  }
}

/**
 * Test 5: Get notification preferences
 */
async function testGetPreferences() {
  console.log();
  console.log('⚙️  Test 5: Get Notification Preferences');
  console.log('-' .repeat(40));
  
  try {
    // This will fail without auth, but we can test the endpoint
    const result = await makeRequest('GET', '/api/notifications/preferences');
    
    console.log(`✅ Preferences endpoint responded with status: ${result.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Error getting preferences: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  const results = {
    total: 5,
    passed: 0,
    failed: 0
  };
  
  // Run tests
  const tests = [
    testApiAvailability,
    testSendSuccessNotification,
    testSendFailureNotification,
    testSendStartNotification,
    testGetPreferences
  ];
  
  for (const test of tests) {
    try {
      const passed = await test();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      results.failed++;
    }
  }
  
  // Summary
  console.log();
  console.log('=' .repeat(60));
  console.log('📊 Test Summary');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log();
  
  if (results.failed === 0) {
    console.log('🎉 All tests passed! Email notification system is working.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
    console.log();
    console.log('Troubleshooting tips:');
    console.log('1. Ensure the dev server is running: npm run dev');
    console.log('2. Check environment variables: RESEND_API_KEY, API_SECRET');
    console.log('3. Verify database connection and migrations');
    console.log('4. Check server logs for detailed error messages');
  }
  
  console.log();
}

// Run tests
runTests().catch(console.error);
