'use client';

import { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

interface ConditionNodeData {
  label: string;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  logic?: 'AND' | 'OR';
}

export default function ConditionNode({ data, id }: NodeProps) {
  const [expanded, setExpanded] = useState(false);
  const conditionData = data as ConditionNodeData;
  const conditions = conditionData.conditions || [];
  const logic = conditionData.logic || 'AND';

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 min-w-[200px]">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-500"
      />

      {/* Header */}
      <div
        className="bg-blue-500 text-white px-4 py-2 rounded-t-md cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-semibold">If/Else</span>
        <span className="text-sm">{expanded ? '▼' : '▶'}</span>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-3 space-y-2">
          <div className="text-sm text-gray-600 mb-2">
            {conditions.length} condition{conditions.length !== 1 ? 's' : ''} ({logic})
          </div>

          {conditions.slice(0, 3).map((condition, idx) => (
            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
              {condition.field} {condition.operator} {String(condition.value)}
            </div>
          ))}

          {conditions.length > 3 && (
            <div className="text-xs text-gray-500">
              +{conditions.length - 3} more conditions
            </div>
          )}
        </div>
      )}

      {/* Label */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 truncate">
          {conditionData.label}
        </div>
      </div>

      {/* Output Handles */}
      <div className="flex justify-around px-2 pb-2">
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="w-3 h-3 bg-green-500"
            style={{ left: '-20px' }}
          />
          <span className="text-xs text-green-600 ml-1">True</span>
        </div>
        <div className="relative">
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3 h-3 bg-red-500"
            style={{ right: '-20px' }}
          />
          <span className="text-xs text-red-600 mr-1">False</span>
        </div>
      </div>
    </div>
  );
}
