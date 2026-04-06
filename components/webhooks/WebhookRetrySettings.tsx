'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Check, Clock } from 'lucide-react';

interface WebhookRetrySettingsProps {
  workflowId: string;
}

interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  strategy: string;
  baseDelay: number;
}

export function WebhookRetrySettings({ workflowId }: WebhookRetrySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<RetryConfig>({
    enabled: true,
    maxRetries: 6,
    strategy: 'exponential',
    baseDelay: 60,
  });

  useEffect(() => {
    loadConfig();
  }, [workflowId]);

  async function loadConfig() {
    try {
      const response = await fetch(`/api/webhooks/${workflowId}`);
      const data = await response.json();
      
      if (data.success) {
        setConfig({
          enabled: data.webhookRetryEnabled ?? true,
          maxRetries: data.webhookMaxRetries ?? 6,
          strategy: data.webhookRetryStrategy ?? 'exponential',
          baseDelay: data.webhookRetryBaseDelay ?? 60,
        });
      }
    } catch (error) {
      console.error('Failed to load retry config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/webhooks/${workflowId}/retry/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadConfig();
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save retry config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  function getRetryPreview() {
    const delays: number[] = [];
    for (let i = 1; i <= config.maxRetries; i++) {
      let delay: number;
      switch (config.strategy) {
        case 'exponential':
          delay = config.baseDelay * Math.pow(2, i - 1);
          break;
        case 'linear':
          delay = config.baseDelay * i;
          break;
        case 'fixed':
        default:
          delay = config.baseDelay;
          break;
      }
      delays.push(Math.min(delay, 3600));
    }
    return delays;
  }

  if (loading) {
    return <Card><CardHeader><CardTitle>Retry Settings</CardTitle></CardHeader></Card>;
  }

  const preview = getRetryPreview();
  const totalWindow = preview.reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          <CardTitle>Webhook Retry Settings</CardTitle>
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          Automatically retry failed webhook deliveries with exponential backoff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Retries</Label>
            <p className="text-sm text-muted-foreground">
              Automatically retry failed deliveries
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
          />
        </div>

        {config.enabled && (
          <>
            <div className="space-y-2">
              <Label>Max Retries</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={config.maxRetries}
                onChange={(e) => setConfig({ ...config, maxRetries: parseInt(e.target.value) || 6 })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum retry attempts (1-10)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Backoff Strategy</Label>
              <select
                value={config.strategy}
                onChange={(e) => setConfig({ ...config, strategy: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="exponential">Exponential (Recommended)</option>
                <option value="linear">Linear</option>
                <option value="fixed">Fixed</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Exponential: 1min, 2min, 4min, 8min... | Linear: 1min, 2min, 3min... | Fixed: constant delay
              </p>
            </div>

            <div className="space-y-2">
              <Label>Base Delay (seconds)</Label>
              <Input
                type="number"
                min={30}
                max={600}
                value={config.baseDelay}
                onChange={(e) => setConfig({ ...config, baseDelay: parseInt(e.target.value) || 60 })}
              />
              <p className="text-xs text-muted-foreground">
                Initial delay before first retry (30-600 seconds)
              </p>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Retry Schedule Preview</span>
              </div>
              <div className="text-xs space-y-1">
                {preview.map((delay, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Attempt {i + 2}:</span>
                    <span>{delay >= 60 ? `${(delay / 60).toFixed(1)} min` : `${delay}s`}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total window:</span>
                  <span>{totalWindow >= 60 ? `${(totalWindow / 60).toFixed(1)} min` : `${totalWindow}s`}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
