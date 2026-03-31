'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Header from '@/components/builder/Header';
import NodePanel from '@/components/builder/NodePanel';
import ConfigPanel from '@/components/builder/ConfigPanel';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 100 },
    data: { label: 'YouTube Upload' },
  },
];

const initialEdges: Edge[] = [];

export default function BuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Node Panel (Left Sidebar) */}
        <NodePanel />

        {/* Canvas (React Flow) */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Controls />
            <Background variant="dots" gap={15} size={1} />
          </ReactFlow>
        </div>

        {/* Config Panel (Right Sidebar) */}
        {selectedNode && (
          <ConfigPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
}
