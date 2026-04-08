'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface TwitterConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function TwitterConfig({ node, onUpdate, onClose }: TwitterConfigProps) {
  const [text, setText] = useState(node.data.text || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/twitter/test', {
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
      text,
      label: `Twitter: ${text.substring(0, 20) || 'Post Tweet'}`,
    });
    onClose();
  };

  const charCount = text.length;
  const charLimit = 280;
  const isOverLimit = charCount > charLimit;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🐦 Twitter/X Config</h2>
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

      {/* Tweet Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Tweet Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's happening?"
          rows={5}
          maxLength={500}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <p className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
            {charCount} / {charLimit} characters
          </p>
          {isOverLimit && (
            <p className="text-xs text-red-400">Over Twitter limit!</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will simulate posting without actually tweeting.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button
          onClick={handleSave}
          disabled={isOverLimit}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
