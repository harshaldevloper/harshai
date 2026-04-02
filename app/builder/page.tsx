'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Header from '@/components/builder/Header';
import NodePanel from '@/components/builder/NodePanel';
import ConfigPanel from '@/components/builder/ConfigPanel';
import SaveButton from '@/components/builder/SaveButton';
import { TriggerNode, ActionNode, ConditionNode } from '@/components/builder/nodes';
import { saveWorkflowLocal, createWorkflow } from '@/lib/workflow-storage';

// Register custom node types
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 100 },
    data: { label: 'YouTube Upload', triggerType: 'youtube' as const },
  },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const variant = event.dataTransfer.getData('variant');
      const label = event.dataTransfer.getData('label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (!position) {
        return;
      }

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: {
          label,
          [type === 'trigger' ? 'triggerType' : type === 'action' ? 'actionType' : 'conditionType']: variant,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [nodes, edges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const workflow = createWorkflow('Untitled Workflow', nodes, edges);
      saveWorkflowLocal(workflow);
      setLastSaved(new Date());
      console.log('[Builder] Auto-saved workflow');
    } catch (error) {
      console.error('[Builder] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col" ref={reactFlowWrapper}>
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Node Panel (Left Sidebar) */}
        <NodePanel />

        {/* Canvas (React Flow) */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onInit={setReactFlowInstance}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            nodeTypes={nodeTypes}
            className="bg-gray-900"
          >
            <Controls className="!bg-gray-800 !border-gray-700" />
            <Background color="#374151" gap={20} />
          </ReactFlow>

          {/* Save Button (Top Right) */}
          <div className="absolute top-4 right-4 z-10">
            <SaveButton 
              onSave={handleSave} 
              isSaving={isSaving}
              lastSaved={lastSaved}
            />
          </div>
        </div>

        {/* Config Panel (Right Sidebar) */}
        {selectedNode && (
          <ConfigPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
            onUpdate={(updatedNode) => {
              setNodes((nds) =>
                nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
