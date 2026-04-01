import { Node, Edge } from 'reactflow';

export interface Workflow {
  id?: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  runs: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Save workflow to localStorage (backup)
 */
export function saveWorkflowLocal(workflow: Workflow): void {
  const workflows = JSON.parse(localStorage.getItem('harshai_workflows') || '[]');
  
  const existingIndex = workflows.findIndex((w: Workflow) => w.id === workflow.id);
  
  if (existingIndex >= 0) {
    workflows[existingIndex] = { ...workflow, updatedAt: new Date() };
  } else {
    workflows.push({ ...workflow, createdAt: new Date(), updatedAt: new Date() });
  }
  
  localStorage.setItem('harshai_workflows', JSON.stringify(workflows));
}

/**
 * Load workflow from localStorage
 */
export function loadWorkflowLocal(id: string): Workflow | null {
  const workflows = JSON.parse(localStorage.getItem('harshai_workflows') || '[]');
  return workflows.find((w: Workflow) => w.id === id) || null;
}

/**
 * Get all workflows from localStorage
 */
export function getAllWorkflowsLocal(): Workflow[] {
  return JSON.parse(localStorage.getItem('harshai_workflows') || '[]');
}

/**
 * Delete workflow from localStorage
 */
export function deleteWorkflowLocal(id: string): void {
  const workflows = JSON.parse(localStorage.getItem('harshai_workflows') || '[]');
  const filtered = workflows.filter((w: Workflow) => w.id !== id);
  localStorage.setItem('harshai_workflows', JSON.stringify(filtered));
}

/**
 * Save workflow to database (API)
 */
export async function saveWorkflowAPI(workflow: Workflow): Promise<Workflow> {
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save workflow');
  }
  
  const data = await response.json();
  return data.workflow;
}

/**
 * Load workflow from database (API)
 */
export async function loadWorkflowAPI(id: string): Promise<Workflow> {
  const response = await fetch(`/api/workflows/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to load workflow');
  }
  
  const data = await response.json();
  return data.workflow;
}

/**
 * Auto-save workflow (debounced)
 */
export function createAutoSave(callback: (workflow: Workflow) => void, delayMs: number = 30000) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (workflow: Workflow) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback(workflow);
    }, delayMs);
  };
}
