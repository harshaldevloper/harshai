/**
 * Diff Engine - Day 39
 * Compare workflow versions
 */

export interface NodeDiff {
  added: any[];
  removed: any[];
  modified: Array<{
    nodeId: string;
    changes: string[];
    oldValue: any;
    newValue: any;
  }>;
}

export interface EdgeDiff {
  added: any[];
  removed: any[];
  modified: any[];
}

/**
 * Compare nodes between two versions
 */
export function diffNodes(oldNodes: any[], newNodes: any[]): NodeDiff {
  const oldNodeMap = new Map(oldNodes.map((n: any) => [n.id, n]));
  const newNodeMap = new Map(newNodes.map((n: any) => [n.id, n]));

  const added: any[] = [];
  const removed: any[] = [];
  const modified: any[] = [];

  // Find added and modified nodes
  for (const newNode of newNodes) {
    const oldNode = oldNodeMap.get(newNode.id);

    if (!oldNode) {
      added.push(newNode);
    } else {
      // Check if modified
      const changes = compareObjects(oldNode, newNode);
      if (changes.length > 0) {
        modified.push({
          nodeId: newNode.id,
          changes,
          oldValue: oldNode,
          newValue: newNode
        });
      }
    }
  }

  // Find removed nodes
  for (const oldNode of oldNodes) {
    if (!newNodeMap.has(oldNode.id)) {
      removed.push(oldNode);
    }
  }

  return { added, removed, modified };
}

/**
 * Compare edges between two versions
 */
export function diffEdges(oldEdges: any[], newEdges: any[]): EdgeDiff {
  const oldEdgeMap = new Map(oldEdges.map((e: any) => [e.id, e]));
  const newEdgeMap = new Map(newEdges.map((e: any) => [e.id, e]));

  const added: any[] = [];
  const removed: any[] = [];
  const modified: any[] = [];

  // Find added and modified edges
  for (const newEdge of newEdges) {
    const oldEdge = oldEdgeMap.get(newEdge.id);

    if (!oldEdge) {
      added.push(newEdge);
    } else {
      // Check if modified
      if (JSON.stringify(oldEdge) !== JSON.stringify(newEdge)) {
        modified.push({
          edgeId: newEdge.id,
          oldValue: oldEdge,
          newValue: newEdge
        });
      }
    }
  }

  // Find removed edges
  for (const oldEdge of oldEdges) {
    if (!newEdgeMap.has(oldEdge.id)) {
      removed.push(oldEdge);
    }
  }

  return { added, removed, modified };
}

/**
 * Compare two objects and return list of changes
 */
function compareObjects(oldObj: any, newObj: any, path: string = ''): string[] {
  const changes: string[] = [];

  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

  for (const key of allKeys) {
    const fullPath = path ? `${path}.${key}` : key;
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];

    if (oldValue === undefined && newValue !== undefined) {
      changes.push(`Added: ${fullPath} = ${truncate(String(newValue))}`);
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push(`Removed: ${fullPath} (was ${truncate(String(oldValue))})`);
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push(`Modified: ${fullPath} (${truncate(String(oldValue))} → ${truncate(String(newValue))})`);
    }
  }

  return changes;
}

/**
 * Generate human-readable diff summary
 */
export function generateDiffSummary(nodeDiff: NodeDiff, edgeDiff: EdgeDiff): string {
  const parts: string[] = [];

  if (nodeDiff.added.length > 0) {
    parts.push(`Added ${nodeDiff.added.length} node${nodeDiff.added.length !== 1 ? 's' : ''}`);
  }

  if (nodeDiff.removed.length > 0) {
    parts.push(`Removed ${nodeDiff.removed.length} node${nodeDiff.removed.length !== 1 ? 's' : ''}`);
  }

  if (nodeDiff.modified.length > 0) {
    parts.push(`Modified ${nodeDiff.modified.length} node${nodeDiff.modified.length !== 1 ? 's' : ''}`);
  }

  if (edgeDiff.added.length > 0) {
    parts.push(`Added ${edgeDiff.added.length} connection${edgeDiff.added.length !== 1 ? 's' : ''}`);
  }

  if (edgeDiff.removed.length > 0) {
    parts.push(`Removed ${edgeDiff.removed.length} connection${edgeDiff.removed.length !== 1 ? 's' : ''}`);
  }

  if (edgeDiff.modified.length > 0) {
    parts.push(`Modified ${edgeDiff.modified.length} connection${edgeDiff.modified.length !== 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No changes';
}

/**
 * Calculate diff statistics
 */
export function calculateDiffStats(nodeDiff: NodeDiff, edgeDiff: EdgeDiff): {
  totalChanges: number;
  nodeChanges: number;
  edgeChanges: number;
  breaking: boolean;
} {
  const nodeChanges = nodeDiff.added.length + nodeDiff.removed.length + nodeDiff.modified.length;
  const edgeChanges = edgeDiff.added.length + edgeDiff.removed.length + edgeDiff.modified.length;
  const totalChanges = nodeChanges + edgeChanges;

  // Consider it breaking if nodes were removed or edges changed significantly
  const breaking = nodeDiff.removed.length > 0 || edgeDiff.removed.length > 2;

  return {
    totalChanges,
    nodeChanges,
    edgeChanges,
    breaking
  };
}

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Deep equality check
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}
