import { Node, Edge } from 'reactflow';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

const STORAGE_KEY = 'harshai_workflows';

/**
 * Save workflow to localStorage (backup)
 */
export function saveWorkflowLocal(workflow: Workflow): void {
  try {
    const existing = getWorkflowsLocal();
    const index = existing.findIndex(w => w.id === workflow.id);
    
    if (index >= 0) {
      existing[index] = workflow;
    } else {
      existing.push(workflow);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('[WorkflowStorage] Saved to localStorage:', workflow.id);
  } catch (error) {
    console.error('[WorkflowStorage] Failed to save locally:', error);
  }
}

/**
 * Get all workflows from localStorage
 */
export function getWorkflowsLocal(): Workflow[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[WorkflowStorage] Failed to load from localStorage:', error);
    return [];
  }
}

/**
 * Get single workflow from localStorage
 */
export function getWorkflowLocal(id: string): Workflow | null {
  const workflows = getWorkflowsLocal();
  return workflows.find(w => w.id === id) || null;
}

/**
 * Delete workflow from localStorage
 */
export function deleteWorkflowLocal(id: string): void {
  try {
    const existing = getWorkflowsLocal();
    const filtered = existing.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('[WorkflowStorage] Deleted from localStorage:', id);
  } catch (error) {
    console.error('[WorkflowStorage] Failed to delete locally:', error);
  }
}

/**
 * Save workflow to database via API
 */
export async function saveWorkflowAPI(workflow: Workflow): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const result = await response.json();
    console.log('[WorkflowStorage] Saved to API:', result);
    return { success: true };
  } catch (error) {
    console.error('[WorkflowStorage] API save failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Load workflow from database via API
 */
export async function loadWorkflowAPI(id: string): Promise<Workflow | null> {
  try {
    const response = await fetch(`/api/workflows/${id}`);
    
    if (!response.ok) {
      return null;
    }

    const workflow = await response.json();
    console.log('[WorkflowStorage] Loaded from API:', id);
    return workflow;
  } catch (error) {
    console.error('[WorkflowStorage] API load failed:', error);
    return null;
  }
}

/**
 * Get all workflows from API
 */
export async function getWorkflowsAPI(): Promise<Workflow[]> {
  try {
    const response = await fetch('/api/workflows');
    
    if (!response.ok) {
      return [];
    }

    const workflows = await response.json();
    console.log('[WorkflowStorage] Loaded workflows from API:', workflows.length);
    return workflows;
  } catch (error) {
    console.error('[WorkflowStorage] API list failed:', error);
    return [];
  }
}

/**
 * Generate unique workflow ID
 */
export function generateWorkflowId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create new workflow object
 */
export function createWorkflow(name: string, nodes: Node[] = [], edges: Edge[] = []): Workflow {
  const now = new Date().toISOString();
  return {
    id: generateWorkflowId(),
    name,
    description: '',
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}
