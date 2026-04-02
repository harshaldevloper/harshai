'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export type TriggerType = 'youtube' | 'schedule' | 'webhook' | 'email' | 'form' | 'social';

export interface TriggerData {
  label: string;
  triggerType: TriggerType;
  config?: Record<string, any>;
}

const triggerIcons: Record<TriggerType, string> = {
  youtube: '🎥',
  schedule: '⏰',
  webhook: '🔗',
  email: '📧',
  form: '📝',
  social: '📱',
};

const triggerColors: Record<TriggerType, string> = {
  youtube: 'from-red-500 to-red-600',
  schedule: 'from-blue-500 to-blue-600',
  webhook: 'from-purple-500 to-purple-600',
  email: 'from-green-500 to-green-600',
  form: 'from-orange-500 to-orange-600',
  social: 'from-pink-500 to-pink-600',
};

export default function TriggerNode({ data }: NodeProps<TriggerData>) {
  const icon = triggerIcons[data.triggerType] || '⚡';
  const color = triggerColors[data.triggerType] || 'from-gray-500 to-gray-600';

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
            <div className="text-white/80 text-xs capitalize">{data.triggerType} Trigger</div>
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
