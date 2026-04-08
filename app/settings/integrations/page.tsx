'use client';

import { useState } from 'react';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  envVar: string;
  howToGetUrl: string;
  status: 'connected' | 'not-connected' | 'testing';
}

export default function IntegrationsPage() {
  const [testMode, setTestMode] = useState(true); // Default to TEST MODE
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT)',
      icon: '🤖',
      description: 'AI text generation, content creation, analysis',
      envVar: 'OPENAI_API_KEY',
      howToGetUrl: 'https://platform.openai.com/api-keys',
      status: 'not-connected',
    },
    {
      id: 'anthropic',
      name: 'Claude (Anthropic)',
      icon: '🧠',
      description: 'AI analysis, writing assistance, reasoning',
      envVar: 'ANTHROPIC_API_KEY',
      howToGetUrl: 'https://console.anthropic.com/settings/keys',
      status: 'not-connected',
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      icon: '🎙️',
      description: 'Text-to-speech, AI voice generation',
      envVar: 'ELEVENLABS_API_KEY',
      howToGetUrl: 'https://elevenlabs.io/app/settings/api-keys',
      status: 'not-connected',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      description: 'Send automated emails',
      envVar: 'GMAIL_ACCESS_TOKEN',
      howToGetUrl: 'https://developers.google.com/gmail/api/quickstart/nodejs',
      status: 'not-connected',
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      description: 'Create pins, boards, save products',
      envVar: 'PINTEREST_ACCESS_TOKEN',
      howToGetUrl: 'https://developers.pinterest.com/',
      status: 'not-connected',
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Post tweets and threads',
      envVar: 'TWITTER_BEARER_TOKEN',
      howToGetUrl: 'https://developer.twitter.com/',
      status: 'not-connected',
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '💬',
      description: 'Send messages to channels',
      envVar: 'DISCORD_BOT_TOKEN',
      howToGetUrl: 'https://discord.com/developers/applications',
      status: 'not-connected',
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📓',
      description: 'Create pages, update databases',
      envVar: 'NOTION_API_KEY',
      howToGetUrl: 'https://www.notion.so/my-integrations',
      status: 'not-connected',
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Post tweets and threads',
      envVar: 'TWITTER_BEARER_TOKEN',
      howToGetUrl: 'https://developer.twitter.com/',
      status: 'not-connected',
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Send messages to channels',
      envVar: 'SLACK_BOT_TOKEN',
      howToGetUrl: 'https://api.slack.com/apps',
      status: 'not-connected',
    },
  ]);

  const handleTestConnection = async (integrationId: string) => {
    // TODO: Implement actual connection test
    alert('Connection test coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#0f0f23]">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold gradient-text mb-2">Integrations</h1>
          <p className="text-gray-400">Connect your favorite tools and services</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Test Mode Toggle */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-lg">🧪 Test Mode</h2>
                <p className="text-gray-400 text-sm">Test workflows without API credentials</p>
              </div>
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  testMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {testMode ? '✅ TEST MODE ON' : '❌ TEST MODE OFF'}
              </button>
            </div>
            {testMode && (
              <div className="bg-green-900/30 rounded-lg p-4 text-sm text-green-300">
                <p>✅ <strong>Test Mode Active</strong> - All integrations will return mock responses (no API keys needed)</p>
                <p className="mt-2 text-gray-400">Perfect for testing workflow logic before connecting real services!</p>
              </div>
            )}
            {!testMode && (
              <div className="bg-yellow-900/30 rounded-lg p-4 text-sm text-yellow-300">
                <p>⚠️ <strong>Production Mode</strong> - Real API calls will be made (API keys required)</p>
                <p className="mt-2 text-gray-400">Make sure you've added your API keys below before using workflows!</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-white font-semibold mb-2">🔑 How It Works</h2>
            <ol className="text-gray-300 space-y-2 text-sm">
              <li>1. <strong>Test Mode:</strong> Try workflows without credentials (recommended for testing)</li>
              <li>2. <strong>Add Credentials:</strong> Click "How to Get" to obtain API keys</li>
              <li>3. <strong>Production:</strong> Turn off Test Mode to use real APIs</li>
            </ol>
            <p className="text-purple-300 text-xs mt-4">
              🔒 Your API keys are stored securely in environment variables.
            </p>
          </div>

          {/* Integration Cards */}
          <div className="grid gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{integration.icon}</span>
                    <div>
                      <h3 className="text-white font-bold text-xl">{integration.name}</h3>
                      <p className="text-gray-400 text-sm">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {testMode && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                        🧪 Test Mode
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        integration.status === 'connected'
                          ? 'bg-green-500/20 text-green-400'
                          : integration.status === 'testing'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {integration.status === 'connected'
                        ? 'Connected'
                        : integration.status === 'testing'
                        ? 'Testing...'
                        : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* API Key Input */}
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-300 text-sm mb-1 block">
                      {integration.envVar}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="password"
                        placeholder={`Enter your ${integration.name} API key...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button
                        onClick={() => handleTestConnection(integration.id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Test
                      </button>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                        Save
                      </button>
                    </div>
                  </div>

                  {/* How to Get Link */}
                  <a
                    href={integration.howToGetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-1"
                  >
                    📖 How to get {integration.name} API key →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              More integrations coming soon: Google Sheets, Make.com, Discord, Webhooks, and 50+ more...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
