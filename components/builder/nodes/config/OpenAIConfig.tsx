'use client';

import { useState } from 'react';

interface OpenAIConfigProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  testMode?: boolean;
}

export default function OpenAIConfig({ config, onChange, testMode }: OpenAIConfigProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const models = [
    { value: 'gpt-4', label: 'GPT-4 (Best quality, slower)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Fast, good quality)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fastest, cheapest)' },
    { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 16K (Long context)' },
  ];

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/integrations/openai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.apiKey })
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🤖</span>
        <h3 className="text-white font-bold text-lg">OpenAI (ChatGPT) Configuration</h3>
      </div>

      {testMode && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-sm text-green-300">
          <p>✅ <strong>Test Mode Active</strong> - No API key needed. Mock responses will be used.</p>
        </div>
      )}

      {/* API Key */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          API Key {testMode && <span className="text-gray-500">(optional in Test Mode)</span>}
        </label>
        <input
          type="password"
          value={config.apiKey || ''}
          onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
          placeholder="sk-..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          disabled={testMode}
        />
        <p className="text-gray-500 text-xs mt-1">
          Get your API key from{' '}
          <a href="https://platform.openai.com/api-keys" target="_blank" className="text-purple-400 hover:underline">
            platform.openai.com
          </a>
        </p>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Model</label>
        <select
          value={config.model || 'gpt-3.5-turbo'}
          onChange={(e) => onChange({ ...config, model: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          {models.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Temperature: {config.temperature ?? 0.7}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature ?? 0.7}
          onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Precise (0)</span>
          <span>Creative (2)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Max Tokens</label>
        <input
          type="number"
          value={config.maxTokens ?? 1024}
          onChange={(e) => onChange({ ...config, maxTokens: parseInt(e.target.value) || 1024 })}
          placeholder="1024"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
        />
        <p className="text-gray-500 text-xs mt-1">
          Maximum length of the response. GPT-4: 8K, GPT-3.5: 16K
        </p>
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">System Prompt (Optional)</label>
        <textarea
          value={config.systemPrompt || ''}
          onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
          placeholder="You are a helpful assistant..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
        />
        <p className="text-gray-500 text-xs mt-1">
          Sets the behavior and personality of the AI
        </p>
      </div>

      {/* Test Connection Button */}
      {!testMode && (
        <div className="pt-4 border-t border-gray-700">
          <button
            onClick={handleTestConnection}
            disabled={testing || !config.apiKey}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>

          {testResult && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              testResult.success 
                ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
                : 'bg-red-900/30 text-red-300 border border-red-500/30'
            }`}>
              {testResult.success ? (
                <p>✅ Connection successful! Your API key is valid.</p>
              ) : (
                <p>❌ {testResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
