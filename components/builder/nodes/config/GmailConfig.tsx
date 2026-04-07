'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface GmailConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function GmailConfig({ node, onUpdate, onClose }: GmailConfigProps) {
  const [to, setTo] = useState(node.data.to || '');
  const [subject, setSubject] = useState(node.data.subject || '');
  const [body, setBody] = useState(node.data.body || '');
  const [isHtml, setIsHtml] = useState(node.data.isHtml || false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/gmail/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      to,
      subject,
      body,
      isHtml,
      label: `Gmail: ${subject || 'Send Email'}`,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">📧 Gmail Config</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      {/* Test Connection */}
      <div className="bg-gray-800/50 rounded-lg p-3">
        <p className="text-sm text-gray-400 mb-2">Connection Status</p>
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {testResult && (
          <p className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResult.message}
          </p>
        )}
      </div>

      {/* Recipient */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter your email message..."
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
        />
      </div>

      {/* HTML Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isHtml"
          checked={isHtml}
          onChange={(e) => setIsHtml(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600"
        />
        <label htmlFor="isHtml" className="text-sm text-gray-300">
          Send as HTML (instead of plain text)
        </label>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will simulate sending without actually delivering emails.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
        >
          Save Configuration
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
