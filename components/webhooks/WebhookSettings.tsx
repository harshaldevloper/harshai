'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

interface WebhookSettingsProps {
  workflowId: string;
  workflowName: string;
}

interface WebhookInfo {
  workflowId: string;
  workflowName: string;
  webhookEnabled: boolean;
  webhookUrl: string | null;
  logsCount: number;
  createdAt: string;
  updatedAt: string;
}

export function WebhookSettings({ workflowId, workflowName }: WebhookSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [logsCount, setLogsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    loadWebhookInfo();
  }, [workflowId]);

  const loadWebhookInfo = async () => {
    try {
      const res = await fetch(`/api/webhooks/${workflowId}`);
      if (res.ok) {
        const data: WebhookInfo = await res.json();
        setEnabled(data.webhookEnabled);
        setWebhookUrl(data.webhookUrl);
        setLogsCount(data.logsCount);
      }
    } catch (error) {
      console.error('Failed to load webhook info:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWebhook = async (newEnabled: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/webhooks/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      
      if (res.ok) {
        setEnabled(newEnabled);
        if (newEnabled) {
          loadWebhookInfo();
        }
      }
    } catch (error) {
      console.error('Failed to toggle webhook:', error);
    } finally {
      setSaving(false);
    }
  };

  const regenerateSecret = async () => {
    if (!confirm('This will invalidate your current webhook URL. Continue?')) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/webhooks/${workflowId}/regenerate`, {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        setWebhookUrl(data.webhookUrl);
        alert('Webhook secret regenerated successfully!');
      }
    } catch (error) {
      console.error('Failed to regenerate secret:', error);
      alert('Failed to regenerate webhook secret');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (webhookUrl) {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Webhook Settings</h3>
          <p className="text-sm text-gray-500 mt-1">
            Allow external services to trigger this workflow
          </p>
        </div>
        <Switch
          checked={enabled}
          onChange={toggleWebhook}
          disabled={saving}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

      {enabled && webhookUrl ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                type={showSecret ? 'text' : 'password'}
                value={webhookUrl}
                readOnly
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50 font-mono"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
              >
                {showSecret ? '🙈' : '👁️'}
              </button>
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
              >
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Integration Examples</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Typeform → Send form submissions</li>
              <li>• Stripe → Payment completed events</li>
              <li>• GitHub → New issues or pull requests</li>
              <li>• Calendly → Meeting booked events</li>
              <li>• Google Forms → Via Zapier/Make</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{logsCount}</span> webhook{logsCount !== 1 ? 's' : ''} received
            </div>
            <button
              onClick={regenerateSecret}
              disabled={saving}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              🔄 Regenerate Secret
            </button>
          </div>
        </div>
      ) : enabled ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Generating webhook URL...</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Webhook is disabled</p>
          <p className="text-sm text-gray-400">
            Enable webhook to receive external triggers
          </p>
        </div>
      )}
    </div>
  );
}
