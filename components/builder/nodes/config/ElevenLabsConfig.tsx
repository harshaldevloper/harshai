'use client';

import { useState } from 'react';
import { Node } from 'reactflow';

interface ElevenLabsConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function ElevenLabsConfig({ node, onUpdate, onClose }: ElevenLabsConfigProps) {
  const [voiceId, setVoiceId] = useState(node.data.voiceId || 'EXAVITQu4vr4xnSDxMaL');
  const [text, setText] = useState(node.data.text || '');
  const [modelId, setModelId] = useState(node.data.modelId || 'eleven_monolingual_v1');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const voices = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel (Professional)' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Friendly)' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh (Deep)' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold (Strong)' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Narrator)' },
  ];

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/elevenlabs/test', {
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
      voiceId,
      text,
      modelId,
      label: `ElevenLabs: ${voices.find(v => v.id === voiceId)?.name || 'Voice'}`,
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🎙️ ElevenLabs Config</h2>
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

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Voice</label>
        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
        <select
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
        >
          <option value="eleven_monolingual_v1">Eleven Monolingual v1 (Fast)</option>
          <option value="eleven_multilingual_v2">Eleven Multilingual v2 (High Quality)</option>
          <option value="eleven_turbo_v2">Eleven Turbo v2 (Fastest)</option>
        </select>
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Text to Speak</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">{text.length} characters</p>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> In Test Mode, this will return mock audio without using API credits.
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
