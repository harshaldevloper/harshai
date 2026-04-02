'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export type ConditionType = 'if-else' | 'filter' | 'switch' | 'router';

export interface ConditionData {
  label: string;
  conditionType: ConditionType;
  condition?: string;
  config?: Record<string, any>;
}

const conditionIcons: Record<ConditionType, string> = {
  'if-else': '🔀',
  filter: '🔍',
  switch: '🔛',
  router: '🛣️',
};

const conditionColors: Record<ConditionType, string> = {
  'if-else': 'from-yellow-500 to-amber-600',
  filter: 'from-cyan-500 to-blue-600',
  switch: 'from-rose-500 to-red-600',
  router: 'from-violet-500 to-purple-600',
};

export default function ConditionNode({ data }: NodeProps<ConditionData>) {
  const icon = conditionIcons[data.conditionType] || '🔀';
  const color = conditionColors[data.conditionType] || 'from-yellow-500 to-amber-600';

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
            <div className="text-white/80 text-xs capitalize">{data.conditionType}</div>
            {data.condition && (
              <div className="text-white/70 text-xs mt-1 truncate max-w-[180px]">
                {data.condition}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Output Handles - True/False branches */}
      <div className="flex justify-between px-4 pb-3">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          className="!bg-green-400 !border-2 !border-white !w-3 !h-3"
          style={{ left: '25%' }}
        />
        <span className="text-xs text-green-300 absolute" style={{ left: '20%', bottom: '8px' }}>Yes</span>
        
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          className="!bg-red-400 !border-2 !border-white !w-3 !h-3"
          style={{ left: '75%' }}
        />
        <span className="text-xs text-red-300 absolute" style={{ left: '70%', bottom: '8px' }}>No</span>
      </div>
    </div>
  );
}
