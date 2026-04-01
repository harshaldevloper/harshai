'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export default function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[200px] ${
      selected 
        ? 'border-yellow-500 bg-yellow-900/50' 
        : 'border-yellow-700 bg-gray-900'
    }`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-yellow-700"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <div className="text-white font-bold text-sm">{data.label}</div>
          <div className="text-yellow-300 text-xs">Condition</div>
        </div>
      </div>
      
      {/* True Output */}
      <div className="text-green-400 text-xs mb-1">✓ True</div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-700 !right-0"
        style={{ top: '30%' }}
      />
      
      {/* False Output */}
      <div className="text-red-400 text-xs mb-1">✗ False</div>
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-red-700 !right-0"
        style={{ top: '70%' }}
      />
    </div>
  );
}
