'use client';

import { memo, useCallback } from 'react';
import { NodeResizer, Handle, Position, NodeProps } from 'reactflow';

export interface ResizableNodeData {
  label: string;
  [key: string]: any;
}

function ResizableNode({ id, data, selected }: NodeProps<ResizableNodeData>) {
  return (
    <>
      <NodeResizer
        nodeId={id}
        isVisible={selected ?? false}
        lineClassName="border-indigo-500"
        handleClassName="h-3 w-3 bg-indigo-500 border border-white rounded"
        minWidth={150}
        minHeight={50}
      />
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg border border-white/20 min-w-[150px] min-h-[50px] p-4">
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-white !border-2 !border-gray-300 !w-4 !h-4"
        />
        
        <div className="text-white font-semibold text-sm">{data.label}</div>
        
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-white !border-2 !border-gray-300 !w-4 !h-4"
        />
      </div>
    </>
  );
}

export default memo(ResizableNode);
