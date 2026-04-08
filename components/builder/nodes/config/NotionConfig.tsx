'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface NotionConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NotionConfig({ node, onUpdate, onClose }: NotionConfigProps) {
  const [databaseId, setDatabaseId] = useState(node.data.databaseId || '');
  const [title, setTitle] = useState(node.data.title || '');
  const [content, setContent] = useState(node.data.content || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/notion/test', {
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
      databaseId,
      title,
      content,
      label: `Notion: ${title || 'Create Page'}`,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">📓 Notion Config</h2>
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

      {/* Database ID */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Database ID</label>
        <input
          type="text"
          value={databaseId}
          onChange={(e) => setDatabaseId(e.target.value)}
          placeholder="e.g., a1b2c3d4e5f6..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Get from Notion: Share → Copy link → Extract ID
        </p>
      </div>

      {/* Page Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Page Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Page Content */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter page content..."
          rows={5}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
        />
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will simulate creating a page without using API.
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
