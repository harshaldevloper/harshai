'use client';

import { useState } from 'react';

interface WebhookTesterProps {
  workflowId: string;
  webhookUrl: string | null;
}

interface TestResult {
  success: boolean;
  executionId?: string;
  output?: any;
  executionTime?: number;
  error?: string;
}

export function WebhookTester({ workflowId, webhookUrl }: WebhookTesterProps) {
  const [payload, setPayload] = useState('{\n  "event": "test",\n  "data": {\n    "message": "Hello from webhook tester"\n  }\n}');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    {
      name: 'Typeform Submission',
      payload: {
        form_id: 'abc123',
        form_name: 'Contact Form',
        submitted_at: new Date().toISOString(),
        answers: [
          { field: 'email', value: 'test@example.com' },
          { field: 'name', value: 'John Doe' },
        ],
      },
    },
    {
      name: 'Stripe Payment',
      payload: {
        id: 'evt_123456',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123456',
            amount: 2999,
            currency: 'usd',
            customer: 'cus_123456',
          },
        },
      },
    },
    {
      name: 'GitHub Issue',
      payload: {
        action: 'opened',
        issue: {
          number: 1,
          title: 'Bug: Something is broken',
          user: { login: 'octocat' },
          body: 'Found a bug...',
        },
        repository: {
          name: 'my-repo',
          full_name: 'octocat/my-repo',
        },
      },
    },
    {
      name: 'Calendly Booking',
      payload: {
        event: 'invitee.created',
        payload: {
          email: 'test@example.com',
          name: 'John Doe',
          start_time: new Date().toISOString(),
          event_type: { name: '30 Minute Meeting' },
        },
      },
    },
  ];

  const loadPreset = (preset: typeof presets[0]) => {
    setPayload(JSON.stringify(preset.payload, null, 2));
    setResult(null);
    setError(null);
  };

  const sendTest = async () => {
    if (!webhookUrl) {
      setError('Webhook is not enabled. Please enable it first.');
      return;
    }

    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const parsedPayload = JSON.parse(payload);
      
      // Extract the secret token from the URL for the test endpoint
      const urlParts = webhookUrl.split('/');
      const secretToken = urlParts.pop();
      const workflowIdFromUrl = urlParts.pop();
      
      // Use the internal API endpoint for testing
      const testUrl = `/api/webhooks/${workflowId}/${secretToken}`;
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (parseError) {
      setError('Invalid JSON payload. Please check your syntax.');
    } catch (fetchError) {
      setError('Failed to send test request. Please try again.');
    } finally {
      setTesting(false);
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(payload);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Tester</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Payload (JSON)
        </label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className={`w-full h-48 px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !validateJson() && payload.trim() ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder='{"key": "value"}'
        />
        {!validateJson() && payload.trim() && (
          <p className="text-red-600 text-xs mt-1">Invalid JSON syntax</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={sendTest}
        disabled={testing || !validateJson() || !webhookUrl}
        className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors ${
          testing || !validateJson() || !webhookUrl
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {testing ? '🔄 Sending...' : '🚀 Send Test Webhook'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="text-green-800 font-medium mb-2">✅ Test Successful</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>Execution ID: <code className="bg-green-100 px-1 rounded">{result.executionId}</code></p>
            {result.executionTime && (
              <p>Execution Time: {result.executionTime}ms</p>
            )}
            {result.output && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">View Output</summary>
                <pre className="mt-2 bg-white p-3 rounded border border-green-200 overflow-x-auto text-xs">
                  {JSON.stringify(result.output, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-800 font-medium mb-2">❌ Test Failed</h4>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!webhookUrl && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ Enable webhook in settings above to test
          </p>
        </div>
      )}
    </div>
  );
}
