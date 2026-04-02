'use client';

import { useCallback } from 'react';

export interface NodeTemplate {
  type: 'trigger' | 'action' | 'condition';
  variant: string;
  label: string;
  description: string;
  icon: string;
}

export default function NodePanel() {
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, variant: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('variant', variant);
    event.dataTransfer.setData('label', label);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const triggers: NodeTemplate[] = [
    { type: 'trigger', variant: 'youtube', label: 'YouTube Upload', description: 'New video uploaded', icon: '🎥' },
    { type: 'trigger', variant: 'schedule', label: 'Schedule', description: 'At scheduled time', icon: '⏰' },
    { type: 'trigger', variant: 'webhook', label: 'Webhook', description: 'HTTP request received', icon: '🔗' },
    { type: 'trigger', variant: 'email', label: 'Email', description: 'New email received', icon: '📧' },
    { type: 'trigger', variant: 'form', label: 'Form', description: 'Form submission', icon: '📝' },
    { type: 'trigger', variant: 'social', label: 'Social Mention', description: 'Brand mentioned', icon: '📱' },
  ];

  const actions: NodeTemplate[] = [
    { type: 'action', variant: 'chatgpt', label: 'ChatGPT', description: 'Generate text', icon: '🤖' },
    { type: 'action', variant: 'claude', label: 'Claude', description: 'AI analysis', icon: '🧠' },
    { type: 'action', variant: 'elevenlabs', label: 'ElevenLabs', description: 'Generate voice', icon: '🎙️' },
    { type: 'action', variant: 'midjourney', label: 'Midjourney', description: 'Generate image', icon: '🎨' },
    { type: 'action', variant: 'notion', label: 'Notion', description: 'Save to database', icon: '📓' },
    { type: 'action', variant: 'gmail', label: 'Gmail', description: 'Send email', icon: '📧' },
    { type: 'action', variant: 'slack', label: 'Slack', description: 'Send message', icon: '💬' },
    { type: 'action', variant: 'spreadsheet', label: 'Spreadsheet', description: 'Update sheet', icon: '📊' },
    { type: 'action', variant: 'webhook', label: 'Webhook', description: 'POST request', icon: '🔗' },
  ];

  const conditions: NodeTemplate[] = [
    { type: 'condition', variant: 'if-else', label: 'If/Else', description: 'Conditional logic', icon: '🔀' },
    { type: 'condition', variant: 'filter', label: 'Filter', description: 'Filter data', icon: '🔍' },
    { type: 'condition', variant: 'switch', label: 'Switch', description: 'Multiple paths', icon: '🔛' },
    { type: 'condition', variant: 'router', label: 'Router', description: 'Split workflow', icon: '🛣️' },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 border-r border-white/10 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-white font-bold text-lg mb-4">Nodes</h2>
        <p className="text-indigo-300 text-sm mb-6">
          Drag nodes to the canvas
        </p>

        {/* Triggers */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span>⚡</span> Triggers
          </h3>
          <div className="space-y-2">
            {triggers.map((node, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, node.type, node.variant, node.label)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{node.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{node.label}</div>
                    <div className="text-indigo-400 text-xs">{node.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Actions */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span>🤖</span> AI Actions
          </h3>
          <div className="space-y-2">
            {actions.map((node, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, node.type, node.variant, node.label)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{node.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{node.label}</div>
                    <div className="text-indigo-400 text-xs">{node.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logic */}
        <div className="mb-6">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <span>🔀</span> Logic
          </h3>
          <div className="space-y-2">
            {conditions.map((node, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, node.type, node.variant, node.label)}
                className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{node.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{node.label}</div>
                    <div className="text-indigo-400 text-xs">{node.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
