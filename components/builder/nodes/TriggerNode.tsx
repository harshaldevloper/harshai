'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export default function TriggerNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 min-w-[200px] ${
      selected 
        ? 'border-purple-500 bg-purple-900/50' 
        : 'border-purple-700 bg-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <div className="text-white font-bold text-sm">{data.label}</div>
          <div className="text-purple-300 text-xs">Trigger</div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-700"
      />
    </div>
  );
}
