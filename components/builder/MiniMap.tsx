'use client';

import { MiniMap as ReactFlowMiniMap } from 'reactflow';

interface MiniMapProps {
  nodeColor?: string;
  maskColor?: string;
}

export default function MiniMap({ 
  nodeColor = '#6366f1',
  maskColor = 'rgba(0, 0, 0, 0.6)'
}: MiniMapProps) {
  return (
    <ReactFlowMiniMap
      nodeColor={nodeColor}
      maskColor={maskColor}
      className="!bg-gray-800 !border !border-gray-700 !rounded-lg"
      nodeStrokeColor="#4f46e5"
      nodeBorderRadius={4}
      pannable={true}
      zoomable={true}
    />
  );
}
