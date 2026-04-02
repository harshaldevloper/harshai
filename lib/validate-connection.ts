import { Node, Edge, Connection } from 'reactflow';

export type NodeType = 'trigger' | 'action' | 'condition';

/**
 * Validate if a connection between two nodes is allowed
 * 
 * Rules:
 * - Trigger → Action (✅)
 * - Trigger → Condition (✅)
 * - Action → Action (✅)
 * - Action → Condition (✅)
 * - Condition → Action (✅)
 * - Condition → Condition (❌)
 * - Action → Trigger (❌)
 * - Condition → Trigger (❌)
 * - Trigger → Trigger (❌)
 */
export function isValidConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): boolean {
  const from = connection.source;
  const to = connection.target;

  if (!from || !to) return false;

  // Find source and target nodes
  const sourceNode = nodes.find((n) => n.id === from);
  const targetNode = nodes.find((n) => n.id === to);

  if (!sourceNode || !targetNode) return false;

  const sourceType = sourceNode.type as NodeType;
  const targetType = targetNode.type as NodeType;

  // Prevent self-connections
  if (from === to) return false;

  // Prevent duplicate connections
  const hasDuplicate = edges.some(
    (e) => e.source === from && e.target === to
  );
  if (hasDuplicate) return false;

  // Validate connection rules
  const allowedConnections: Record<NodeType, NodeType[]> = {
    trigger: ['action', 'condition'],
    action: ['action', 'condition'],
    condition: ['action'],
  };

  return allowedConnections[sourceType]?.includes(targetType) ?? false;
}

/**
 * Get all downstream nodes from a given node
 */
export function getDownstreamNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): string[] {
  const downstream: string[] = [];
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const outgoingEdges = edges.filter((e) => e.source === currentId);

    for (const edge of outgoingEdges) {
      if (!downstream.includes(edge.target)) {
        downstream.push(edge.target);
        queue.push(edge.target);
      }
    }
  }

  return downstream;
}

/**
 * Check if removing a node would orphan other nodes
 */
export function wouldOrphanNodes(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): boolean {
  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) return false;

  // Check if this is a trigger node (root node)
  if (targetNode.type === 'trigger') {
    const downstream = getDownstreamNodes(nodeId, nodes, edges);
    return downstream.length > 0;
  }

  return false;
}
