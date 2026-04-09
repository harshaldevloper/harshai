'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
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
  ReactFlowJsonObject,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Header from '@/components/builder/Header';
import NodePanel from '@/components/builder/NodePanel';
import ConfigPanel from '@/components/builder/ConfigPanel';
import SaveButton from '@/components/builder/SaveButton';
import { TriggerNode, ActionNode, ConditionNode } from '@/components/builder/nodes';
import { saveWorkflowLocal, createWorkflow } from '@/lib/workflow-storage';
import { isValidConnection, wouldOrphanNodes } from '@/lib/validate-connection';
import { getTemplateById } from '@/lib/templates';

// Register custom node types
const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

function Flow() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/builder');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">Loading...</div>
          <div className="text-indigo-300">Please sign in to access the builder</div>
        </div>
      </div>
    );
  }
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-add default Trigger node on first load
  useEffect(() => {
    if (nodes.length === 0 && !templateLoaded && reactFlowInstance) {
      // Add a default Schedule Trigger node to get users started
      const defaultTrigger: Node = {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Schedule Trigger',
          triggerType: 'schedule',
        },
      };
      setNodes([defaultTrigger]);
      console.log('[Builder] Auto-added default trigger node');
    }
  }, [reactFlowInstance, nodes.length, templateLoaded, setNodes]);

  // Load template from URL parameter or localStorage
  useEffect(() => {
    const templateId = localStorage.getItem('template-to-import');
    if (templateId && !templateLoaded) {
      const template = getTemplateById(templateId);
      if (template) {
        // Convert template nodes to ReactFlow nodes
        const templateNodes: Node[] = template.nodes.map(n => ({
          ...n,
          data: { ...n.data }
        }));
        
        // Convert template edges to ReactFlow edges
        const templateEdges: Edge[] = template.edges.map(e => ({
          ...e,
          id: e.id || `e${e.source}-${e.target}`
        }));

        setNodes(templateNodes);
        setEdges(templateEdges);
        setTemplateLoaded(true);
        localStorage.removeItem('template-to-import');
        console.log('[Builder] Template loaded:', template.name);
      }
    }
  }, [templateLoaded, setNodes, setEdges]);

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

  const onConnect = useCallback(
    (params: Connection) => {
      if (isValidConnection(params, nodes, edges)) {
        setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds));
      } else {
        // More helpful error message
        const hasTrigger = nodes.some(n => n.type === 'trigger');
        if (!hasTrigger) {
          alert('Start by adding a Trigger node first! Drag a trigger from the left panel, then connect it to an Action.');
        } else {
          alert('Invalid connection! Rules:\n\n✅ Trigger → Action\n✅ Trigger → Condition\n✅ Action → Action\n✅ Action → Condition\n✅ Condition → Action\n\n❌ No loops back to Trigger\n❌ Condition → Condition');
        }
      }
    },
    [nodes, edges, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete node with Backspace or Delete key
      if (event.key === 'Backspace' || event.key === 'Delete') {
        // Don't delete if user is typing in an input
        if ((event.target as HTMLElement).tagName === 'INPUT' || 
            (event.target as HTMLElement).tagName === 'TEXTAREA') {
          return;
        }

        if (selectedNode) {
          // Check if deleting would orphan nodes
          if (wouldOrphanNodes(selectedNode.id, nodes, edges)) {
            const confirmDelete = confirm(
              'Deleting this node will also remove connected nodes. Continue?'
            );
            if (!confirmDelete) return;
          }

          setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
          setEdges((eds) => eds.filter((edge) => 
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
          ));
          setSelectedNode(null);
        } else if (selectedEdge) {
          setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
          setSelectedEdge(null);
        }
      }

      // Undo (Ctrl+Z)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        console.log('[Builder] Undo triggered (not yet implemented)');
        // TODO: Implement undo/redo with history stack
      }

      // Save (Ctrl+S)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge, nodes, edges, handleSave]);

  // Auto-save DISABLED - localStorage quota issues (5MB limit)
  // Manual save only (Ctrl+S or Save button)
  useEffect(() => {
    // No auto-save - user must explicitly save
    console.log('[Builder] Auto-save disabled to prevent localStorage quota issues');
  }, []);



  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Also remove edges connected to deleted nodes
      const deletedIds = deleted.map((n) => n.id);
      setEdges((eds) =>
        eds.filter((edge) => !deletedIds.includes(edge.source) && !deletedIds.includes(edge.target))
      );
    },
    [setEdges]
  );

  return (
    <div className="h-screen flex flex-col" ref={reactFlowWrapper}>
      <Header />
      
      {/* Mobile Banner - Recommend Desktop */}
      {isMobile && (
        <div className="bg-yellow-600/90 border-b border-yellow-500 px-4 py-3 text-center">
          <p className="text-white text-sm">
            📱 <strong>Desktop Recommended:</strong> For the best workflow building experience, please use a desktop or laptop. 
            <button 
              onClick={() => setShowNodePanel(!showNodePanel)}
              className="ml-2 underline text-yellow-200"
            >
              Toggle Nodes Panel
            </button>
          </p>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Node Panel (Left Sidebar) - Hidden on mobile unless toggled */}
        {(!isMobile || showNodePanel) && (
          <div className={isMobile ? 'absolute z-20 h-full' : ''}>
            <NodePanel />
            {isMobile && (
              <button
                onClick={() => setShowNodePanel(false)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Mobile Toggle Button (when panel is hidden) */}
        {isMobile && !showNodePanel && (
          <button
            onClick={() => setShowNodePanel(true)}
            className="absolute bottom-4 left-4 z-20 bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 shadow-lg"
          >
            ⚡ Nodes
          </button>
        )}

        {/* Canvas (React Flow) */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodesDelete={onNodesDelete}
            onInit={setReactFlowInstance}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            nodeTypes={nodeTypes}
            className="bg-gray-900"
            deleteKeyCode={['Backspace', 'Delete']} // Allow Delete/Backspace to delete nodes
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

          {/* Keyboard Shortcuts Help (Bottom Left) */}
          <div className="absolute bottom-4 left-4 z-10 bg-gray-800/90 border border-gray-700 rounded-lg p-3 text-xs text-gray-300">
            <div className="font-semibold text-white mb-2">⌨️ Keyboard Shortcuts</div>
            <div className="space-y-1">
              <div><kbd className="bg-gray-700 px-1 rounded">Delete</kbd> Remove selected node/edge</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+S</kbd> Save workflow</div>
              <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Z</kbd> Undo (coming soon)</div>
            </div>
          </div>
        </div>

        {/* Config Panel (Right Sidebar) */}
        {selectedNode && (
          <ConfigPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Edge Config Panel */}
        {selectedEdge && (
          <div className="absolute top-4 right-4 z-20 bg-gray-800 border border-gray-700 rounded-lg p-4 w-64 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">Connection</h3>
              <button
                onClick={() => {
                  setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
                  setSelectedEdge(null);
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
            <div className="text-gray-400 text-sm">
              <div>From: <span className="text-white">{selectedEdge.source}</span></div>
              <div>To: <span className="text-white">{selectedEdge.target}</span></div>
            </div>
          </div>
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
