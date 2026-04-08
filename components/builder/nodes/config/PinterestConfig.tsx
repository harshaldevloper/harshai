'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface PinterestConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function PinterestConfig({ node, onUpdate, onClose }: PinterestConfigProps) {
  const [boardId, setBoardId] = useState(node.data.boardId || '');
  const [title, setTitle] = useState(node.data.title || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [imageUrl, setImageUrl] = useState(node.data.imageUrl || '');
  const [link, setLink] = useState(node.data.link || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/pinterest/test', {
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
      boardId,
      title,
      description,
      imageUrl,
      link,
      label: `Pinterest: ${title || 'Create Pin'}`,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">📌 Pinterest Config</h2>
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

      {/* Board ID */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Board ID</label>
        <input
          type="text"
          value={boardId}
          onChange={(e) => setBoardId(e.target.value)}
          placeholder="e.g., 123456789012345678"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Pin Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Pin Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter pin title"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter pin description..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Destination Link */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Destination Link (Optional)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://yourwebsite.com/product"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will simulate creating a pin without using API.
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
