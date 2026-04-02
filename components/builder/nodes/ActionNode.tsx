'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export type ActionType = 
  | 'chatgpt' | 'claude' | 'elevenlabs' | 'midjourney' 
  | 'notion' | 'gmail' | 'slack' | 'spreadsheet' | 'webhook';

export interface ActionData {
  label: string;
  actionType: ActionType;
  config?: Record<string, any>;
}

const actionIcons: Record<ActionType, string> = {
  chatgpt: '🤖',
  claude: '🧠',
  elevenlabs: '🎙️',
  midjourney: '🎨',
  notion: '📓',
  gmail: '📧',
  slack: '💬',
  spreadsheet: '📊',
  webhook: '🔗',
};

const actionColors: Record<ActionType, string> = {
  chatgpt: 'from-emerald-500 to-teal-600',
  claude: 'from-amber-500 to-orange-600',
  elevenlabs: 'from-indigo-500 to-purple-600',
  midjourney: 'from-pink-500 to-rose-600',
  notion: 'from-gray-700 to-gray-900',
  gmail: 'from-red-400 to-red-600',
  slack: 'from-violet-500 to-purple-600',
  spreadsheet: 'from-green-500 to-emerald-600',
  webhook: 'from-blue-500 to-cyan-600',
};

export default function ActionNode({ data }: NodeProps<ActionData>) {
  const icon = actionIcons[data.actionType] || '⚡';
  const color = actionColors[data.actionType] || 'from-gray-500 to-gray-600';

  return (
    <div className={`bg-gradient-to-r ${color} rounded-lg shadow-lg border border-white/20 min-w-[200px]`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-white !border-2 !border-gray-300 !w-4 !h-4"
      />

      {/* Node Content */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="text-white font-semibold text-sm">{data.label}</div>
            <div className="text-white/80 text-xs capitalize">{data.actionType} Action</div>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white !border-2 !border-gray-300 !w-4 !h-4"
      />
    </div>
  );
}
