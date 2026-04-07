'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface SlackConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function SlackConfig({ node, onUpdate, onClose }: SlackConfigProps) {
  const [channel, setChannel] = useState(node.data.channel || '');
  const [text, setText] = useState(node.data.text || '');
  const [username, setUsername] = useState(node.data.username || '');
  const [iconEmoji, setIconEmoji] = useState(node.data.iconEmoji || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/slack/test', {
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
      channel,
      text,
      username,
      iconEmoji,
      label: `Slack: ${text.substring(0, 20) || 'Send Message'}`,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">💬 Slack Config</h2>
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

      {/* Channel */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Channel</label>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="e.g., #general or C01234567"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use #channel-name for public channels, or channel ID for private
        </p>
      </div>

      {/* Message Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your Slack message..."
          rows={5}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{text.length} characters</p>
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Username (Optional)</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Bot name"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
      </div>

      {/* Icon Emoji */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Icon Emoji (Optional)</label>
        <input
          type="text"
          value={iconEmoji}
          onChange={(e) => setIconEmoji(e.target.value)}
          placeholder="e.g., :robot_face: or :tada:"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">Slack emoji shortcode</p>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will simulate sending without actually posting to Slack.
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
