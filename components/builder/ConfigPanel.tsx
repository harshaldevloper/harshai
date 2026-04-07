'use client';

import { Node } from 'reactflow';
import { useState } from 'react';
import OpenAIConfig from './nodes/config/OpenAIConfig';
import ClaudeConfig from './nodes/config/ClaudeConfig';

interface ConfigPanelProps {
  node: Node;
  onClose: () => void;
}

export default function ConfigPanel({ node, onClose }: ConfigPanelProps) {
  return (
    <div className="w-96 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 border-l border-white/10 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Configure Node</h2>
          <button
            onClick={onClose}
            className="text-indigo-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Node Type */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <div className="text-indigo-300 text-sm mb-1">Node Type</div>
          <div className="text-white font-semibold">{node.type}</div>
        </div>

        {/* Node Label */}
        <div className="mb-6">
          <label className="block text-indigo-300 text-sm mb-2">
            Node Name
          </label>
          <input
            type="text"
            defaultValue={node.data.label}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Dynamic Fields Based on Node Type */}
        {node.type === 'trigger' && (
          <>
            <div className="mb-6">
              <label className="block text-indigo-300 text-sm mb-2">
                Trigger Type
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500">
                <option>Webhook</option>
                <option>Schedule</option>
                <option>YouTube Upload</option>
                <option>Form Submission</option>
                <option>New Email</option>
              </select>
            </div>

            {node.data.label === 'Schedule' && (
              <div className="mb-6">
                <label className="block text-indigo-300 text-sm mb-2">
                  Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g., Every Monday at 9 AM"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </>
        )}

        {node.type === 'action' && (
          <>
            <div className="mb-6">
              <label className="block text-indigo-300 text-sm mb-2">
                AI Tool
              </label>
              <select 
                defaultValue={node.data.actionType || 'chatgpt'}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="chatgpt">ChatGPT (OpenAI)</option>
                <option value="claude">Claude (Anthropic)</option>
                <option value="elevenlabs">ElevenLabs</option>
                <option value="midjourney">Midjourney</option>
                <option value="jasper">Jasper</option>
              </select>
            </div>

            {/* OpenAI/ChatGPT Configuration */}
            {node.data.actionType === 'chatgpt' && (
              <div className="mb-6">
                <OpenAIConfig 
                  config={node.data.config || {}}
                  onChange={(newConfig) => {
                    // TODO: Update node data with new config
                    console.log('OpenAI config changed:', newConfig);
                  }}
                  testMode={process.env.NEXT_PUBLIC_TEST_MODE === 'true'}
                />
              </div>
            )}

            {/* Anthropic/Claude Configuration */}
            {node.data.actionType === 'claude' && (
              <div className="mb-6">
                <ClaudeConfig 
                  config={node.data.config || {}}
                  onChange={(newConfig) => {
                    // TODO: Update node data with new config
                    console.log('Claude config changed:', newConfig);
                  }}
                  testMode={process.env.NEXT_PUBLIC_TEST_MODE === 'true'}
                />
              </div>
            )}

            {/* Generic Prompt for Other Actions */}
            {node.data.actionType !== 'chatgpt' && node.data.actionType !== 'claude' && (
              <div className="mb-6">
                <label className="block text-indigo-300 text-sm mb-2">
                  Prompt / Instructions
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter your prompt here..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all"
        >
          Save Configuration
        </button>

        {/* Delete Button */}
        <button className="w-full py-3 mt-3 text-red-400 hover:text-red-300 transition-colors">
          Delete Node
        </button>
      </div>
    </div>
  );
}
