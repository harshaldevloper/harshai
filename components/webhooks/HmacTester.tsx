'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Send, CheckCircle, XCircle, Copy, Code } from 'lucide-react';

interface HmacTesterProps {
  workflowId: string;
  webhookUrl: string;
}

export function HmacTester({ workflowId, webhookUrl }: HmacTesterProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [payload, setPayload] = useState(JSON.stringify({
    event: 'test.webhook',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Test webhook payload',
      value: 123,
    },
  }, null, 2));
  const [service, setService] = useState<'stripe' | 'github' | 'slack' | 'custom'>('custom');
  const [signingSecret, setSigningSecret] = useState('');

  async function generateSignature() {
    if (!signingSecret || !payload) {
      alert('Please enter a signing secret and payload');
      return;
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const payloadStr = payload;
      
      // Generate signature based on service
      let signature: string;
      let headerValue: string;
      
      const encoder = new TextEncoder();
      const keyData = encoder.encode(signingSecret);
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      let dataToSign: string;
      
      switch (service) {
        case 'stripe':
          dataToSign = `${timestamp}.${payloadStr}`;
          break;
        case 'github':
          dataToSign = payloadStr;
          break;
        case 'slack':
          dataToSign = `v0:${timestamp}:${payloadStr}`;
          break;
        case 'custom':
        default:
          dataToSign = payloadStr;
          break;
      }
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        encoder.encode(dataToSign)
      );
      
      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Format header value based on service
      switch (service) {
        case 'stripe':
          headerValue = `t=${timestamp},v1=${signature}`;
          break;
        case 'github':
          headerValue = `sha256=${signature}`;
          break;
        case 'slack':
          headerValue = `v0=${signature}`;
          break;
        case 'custom':
        default:
          headerValue = signature;
          break;
      }
      
      return { signature, headerValue, timestamp };
    } catch (error) {
      console.error('Failed to generate signature:', error);
      alert('Failed to generate signature. Check your browser supports Web Crypto API.');
      return null;
    }
  }

  async function handleTest() {
    setTesting(true);
    setResult(null);
    
    try {
      // First, generate the signature
      const sigData = await generateSignature();
      if (!sigData) return;
      
      // Get the signature header name from the workflow config
      const configResponse = await fetch(`/api/webhooks/${workflowId}/signature/configure`);
      const configData = await configResponse.json();
      const signatureHeader = configData.signatureHeader || 'X-Signature-256';
      
      // Send test webhook
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add signature header based on service
      switch (service) {
        case 'stripe':
          headers['stripe-signature'] = sigData.headerValue;
          break;
        case 'github':
          headers['x-hub-signature-256'] = sigData.headerValue;
          headers['x-hub-signature-timestamp'] = sigData.timestamp.toString();
          break;
        case 'slack':
          headers['x-slack-signature'] = sigData.headerValue;
          headers['x-slack-request-timestamp'] = sigData.timestamp.toString();
          break;
        case 'custom':
        default:
          headers[signatureHeader] = sigData.headerValue;
          headers['x-timestamp'] = sigData.timestamp.toString();
          break;
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: payload,
      });
      
      const data = await response.json();
      
      setResult({
        success: response.ok,
        status: response.status,
        data,
        signature: sigData.signature,
        timestamp: sigData.timestamp,
        header: signatureHeader,
        headerValue: sigData.headerValue,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  }

  async function handleLoadPreset(preset: string) {
    const presets: Record<string, any> = {
      stripe: {
        event: 'payment_intent.succeeded',
        id: 'pi_1234567890',
        amount: 9900,
        currency: 'usd',
        customer: 'cus_1234567890',
      },
      github: {
        action: 'opened',
        issue: {
          number: 1,
          title: 'Bug: Something is broken',
          user: { login: 'octocat' },
        },
        repository: {
          name: 'my-repo',
          full_name: 'octocat/my-repo',
        },
      },
      slack: {
        token: 'verification_token',
        team_id: 'T123456',
        user_id: 'U123456',
        text: '/command argument',
        channel_id: 'C123456',
      },
    };
    
    setPayload(JSON.stringify(presets[preset] || presets.custom, null, 2));
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <CardTitle>HMAC Signature Tester</CardTitle>
        </div>
        <CardDescription>
          Generate valid signatures and test your webhook configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Service Format</label>
          <Select value={service} onValueChange={(v) => setService(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Signing Secret */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Signing Secret</label>
          <Textarea
            value={signingSecret}
            onChange={(e) => setSigningSecret(e.target.value)}
            placeholder="whsec_..."
            className="font-mono text-sm"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            Get this from your HMAC configuration above
          </p>
        </div>

        {/* Payload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Test Payload (JSON)</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadPreset(service === 'custom' ? 'stripe' : service)}
              >
                Load Preset
              </Button>
            </div>
          </div>
          <Textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="font-mono text-xs"
            rows={8}
          />
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTest}
          disabled={testing || !signingSecret}
          className="w-full"
        >
          {testing ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Test Signature
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-md border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Signature Verified Successfully' : 'Signature Verification Failed'}
              </span>
            </div>
            
            {result.status && (
              <div className="text-sm mb-2">
                <span className="font-medium">HTTP Status:</span> {result.status}
              </div>
            )}
            
            {result.signature && (
              <div className="text-xs space-y-1 bg-background p-2 rounded font-mono">
                <div><span className="text-muted-foreground">Signature:</span> {result.signature}</div>
                <div><span className="text-muted-foreground">Timestamp:</span> {result.timestamp}</div>
                <div><span className="text-muted-foreground">Header:</span> {result.header}</div>
                <div><span className="text-muted-foreground">Value:</span> {result.headerValue}</div>
              </div>
            )}
            
            {result.data && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Response:</p>
                <pre className="bg-background p-2 rounded text-xs overflow-x-auto max-h-48">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            {result.error && (
              <div className="mt-2 text-sm text-red-600">
                <p className="font-medium">Error:</p>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Code Example */}
        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4" />
            <span className="text-sm font-medium">cURL Example</span>
          </div>
          <pre className="text-xs overflow-x-auto bg-background p-2 rounded">
{`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "${service === 'stripe' ? 'Stripe-Signature' : service === 'github' ? 'X-Hub-Signature-256' : 'X-Signature-256'}: <signature>" \\
  -d '${payload.substring(0, 100)}...'`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
