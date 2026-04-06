'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Shield, AlertTriangle, RefreshCw } from 'lucide-react';

interface HmacConfigurationProps {
  workflowId: string;
  workflowName: string;
}

interface HmacConfig {
  enabled: boolean;
  algorithm: string;
  signatureHeader: string;
  timestampTolerance: number;
  hasSigningSecret: boolean;
  secretPrefix: string | null;
}

export function HmacConfiguration({ workflowId, workflowName }: HmacConfigurationProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<HmacConfig | null>(null);
  const [signingSecret, setSigningSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [algorithm, setAlgorithm] = useState('sha256');
  const [signatureHeader, setSignatureHeader] = useState('X-Signature-256');
  const [timestampTolerance, setTimestampTolerance] = useState(300);

  useEffect(() => {
    loadConfig();
  }, [workflowId]);

  async function loadConfig() {
    try {
      const response = await fetch(`/api/webhooks/${workflowId}/signature/configure`);
      const data = await response.json();
      
      if (data.success) {
        setConfig(data);
        setEnabled(data.enabled);
        setAlgorithm(data.algorithm || 'sha256');
        setSignatureHeader(data.signatureHeader || 'X-Signature-256');
        setTimestampTolerance(data.timestampTolerance || 300);
      }
    } catch (error) {
      console.error('Failed to load HMAC config:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/webhooks/${workflowId}/signature/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          algorithm,
          signatureHeader,
          timestampTolerance,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.signingSecret) {
          setSigningSecret(data.signingSecret);
        }
        await loadConfig();
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save HMAC config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  async function handleCopySecret() {
    if (signingSecret) {
      await navigator.clipboard.writeText(signingSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>HMAC Signature Verification</CardTitle>
          <CardDescription>Loading configuration...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>HMAC Signature Verification</CardTitle>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <CardDescription>
          Add enterprise-grade security to your webhooks with HMAC signature verification (Stripe-style)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable HMAC Verification</Label>
            <p className="text-sm text-muted-foreground">
              Require valid HMAC signatures on all webhook requests
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            disabled={saving}
          />
        </div>

        {enabled && (
          <>
            {/* Algorithm Selection */}
            <div className="space-y-2">
              <Label>Signature Algorithm</Label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={saving}
              >
                <option value="sha256">HMAC-SHA256 (Recommended)</option>
                <option value="sha512">HMAC-SHA512 (Maximum Security)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                SHA-256 is recommended for most use cases. SHA-512 provides extra security for sensitive data.
              </p>
            </div>

            {/* Signature Header */}
            <div className="space-y-2">
              <Label>Signature Header Name</Label>
              <Input
                value={signatureHeader}
                onChange={(e) => setSignatureHeader(e.target.value)}
                placeholder="X-Signature-256"
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Common values: X-Signature-256, Stripe-Signature, X-Hub-Signature-256, X-Slack-Signature
              </p>
            </div>

            {/* Timestamp Tolerance */}
            <div className="space-y-2">
              <Label>Timestamp Tolerance (seconds)</Label>
              <Input
                type="number"
                value={timestampTolerance}
                onChange={(e) => setTimestampTolerance(parseInt(e.target.value))}
                min={60}
                max={3600}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                Reject webhooks with timestamps older than this value. Prevents replay attacks. (60-3600 seconds)
              </p>
            </div>

            {/* Signing Secret Display */}
            {signingSecret && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <div className="space-y-2">
                    <p className="font-semibold">⚠️ Store this signing secret securely!</p>
                    <p className="text-sm">
                      This secret will be shown only once. Save it in your webhook sender's configuration (Stripe, GitHub, etc.).
                    </p>
                    <div className="flex gap-2 mt-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded text-sm font-mono truncate">
                        {showSecret ? signingSecret : '••••••••••••••••••••••••••••••••'}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? 'Hide' : 'Show'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopySecret}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Integration Examples */}
            <div className="space-y-2">
              <Label>Integration Examples</Label>
              <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Stripe:</p>
                  <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                    {`Stripe-Signature: t=1234567890,v1=abc123...`}
                  </pre>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">GitHub:</p>
                  <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                    {`X-Hub-Signature-256: sha256=abc123...`}
                  </pre>
                </div>
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Custom:</p>
                  <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
                    {`${signatureHeader}: abc123...`}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !enabled}
          className="w-full"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            enabled ? 'Save Configuration' : 'Enable to Configure'
          )}
        </Button>

        {/* Security Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Constant-time signature comparison (prevents timing attacks)</p>
          <p>✓ Timestamp verification (prevents replay attacks)</p>
          <p>✓ Works with Stripe, GitHub, Slack, and custom webhooks</p>
          <p>✓ Can be used alongside URL secret tokens for layered security</p>
        </div>
      </CardContent>
    </Card>
  );
}
