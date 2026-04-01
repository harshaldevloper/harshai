'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export default function ActionNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[200px] ${
      selected 
        ? 'border-indigo-500 bg-indigo-900/50' 
        : 'border-indigo-700 bg-gray-900'
    }`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-700"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <div className="text-white font-bold text-sm">{data.label}</div>
          <div className="text-indigo-300 text-xs">Action</div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-700"
      />
    </div>
  );
}
