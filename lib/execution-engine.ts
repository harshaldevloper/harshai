/**
 * Workflow Execution Engine
 * Executes workflows by processing nodes in order and passing data between them
 */

import { WorkflowTemplate } from './templates';

export interface ExecutionContext {
  workflowId: string;
  workflowName: string;
  data: Record<string, any>;
  variables: Record<string, any>;
  executionId?: string;
  startedAt: Date;
}

export interface ExecutionResult {
  success: boolean;
  output: Record<string, any>;
  error?: string;
  executionTime: number;
  stepsExecuted: number;
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: any;
  error?: string;
}

/**
 * Main Workflow Execution Engine
 */
export class WorkflowExecutionEngine {
  private context: ExecutionContext;
  private nodeResults: Map<string, NodeExecutionResult> = new Map();

  constructor(workflowId: string, workflowName: string, initialData: Record<string, any> = {}) {
    this.context = {
      workflowId,
      workflowName,
      data: initialData,
      variables: {},
      startedAt: new Date(),
    };
  }

  /**
   * Execute a workflow
   */
  async execute(nodes: WorkflowTemplate['nodes'], edges: WorkflowTemplate['edges']): Promise<ExecutionResult> {
    const startTime = Date.now();
    let stepsExecuted = 0;

    try {
      // Sort nodes in execution order (topological sort based on edges)
      const sortedNodes = this.topologicalSort(nodes, edges);

      // Execute each node in order
      for (const node of sortedNodes) {
        const result = await this.executeNode(node);
        this.nodeResults.set(node.id, result);

        if (!result.success) {
          return {
            success: false,
            output: this.context.data,
            error: `Node "${node.data.label}" failed: ${result.error}`,
            executionTime: Date.now() - startTime,
            stepsExecuted,
          };
        }

        // Merge node output into context data
        this.context.data = {
          ...this.context.data,
          ...result.output,
        };

        stepsExecuted++;
      }

      return {
        success: true,
        output: this.context.data,
        executionTime: Date.now() - startTime,
        stepsExecuted,
      };
    } catch (error) {
      return {
        success: false,
        output: this.context.data,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        stepsExecuted,
      };
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(node: WorkflowTemplate['nodes'][number]): Promise<NodeExecutionResult> {
    console.log(`[Executor] Executing node: ${node.data.label} (${node.type})`);

    try {
      let output: any;

      switch (node.type) {
        case 'trigger':
          output = await this.executeTrigger(node);
          break;
        case 'action':
          output = await this.executeAction(node);
          break;
        case 'condition':
          output = await this.executeCondition(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      return {
        nodeId: node.id,
        success: true,
        output,
      };
    } catch (error) {
      return {
        nodeId: node.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Execution failed',
      };
    }
  }

  /**
   * Execute trigger node
   */
  private async executeTrigger(node: WorkflowTemplate['nodes'][number]): Promise<any> {
    const triggerType = node.data.triggerType;
    console.log(`[Executor] Trigger type: ${triggerType}`);

    // For now, triggers just pass through the initial data
    // In production, this would fetch data from the trigger source
    switch (triggerType) {
      case 'webhook':
        return { triggerType: 'webhook', receivedAt: new Date().toISOString() };
      case 'schedule':
        return { triggerType: 'schedule', scheduledAt: new Date().toISOString() };
      case 'youtube':
        return { triggerType: 'youtube', videoId: this.context.data.videoId || 'demo-video' };
      case 'form':
        return { triggerType: 'form', formData: this.context.data.formData || {} };
      case 'email':
        return { triggerType: 'email', emailData: this.context.data.emailData || {} };
      default:
        return { triggerType, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Execute action node
   */
  private async executeAction(node: WorkflowTemplate['nodes'][number]): Promise<any> {
    const actionType = node.data.actionType;
    const config = node.data.config || {};

    console.log(`[Executor] Action type: ${actionType}`, config);

    // Import action executors dynamically
    const { executeAction } = await import('./action-executors');
    
    try {
      const result = await executeAction(actionType, config, this.context.data);
      return { actionType, result };
    } catch (error) {
      console.error(`[Executor] Action failed: ${actionType}`, error);
      throw error;
    }
  }

  /**
   * Execute condition node
   */
  private async executeCondition(node: WorkflowTemplate['nodes'][number]): Promise<any> {
    const conditionType = node.data.conditionType;
    const config = node.data.config || {};

    console.log(`[Executor] Condition type: ${conditionType}`, config);

    // Evaluate condition based on config
    const { condition, operator, value } = config;
    const actualValue = this.context.data[condition];

    let result = false;
    switch (operator) {
      case 'equals':
        result = actualValue === value;
        break;
      case 'not_equals':
        result = actualValue !== value;
        break;
      case 'contains':
        result = actualValue?.includes?.(value);
        break;
      case 'greater_than':
        result = actualValue > value;
        break;
      case 'less_than':
        result = actualValue < value;
        break;
      default:
        result = false;
    }

    console.log(`[Executor] Condition result: ${result} (${actualValue} ${operator} ${value})`);
    
    return {
      conditionType,
      result,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Topological sort of nodes based on edges
   */
  private topologicalSort(
    nodes: WorkflowTemplate['nodes'],
    edges: WorkflowTemplate['edges']
  ): WorkflowTemplate['nodes'] {
    // Build adjacency list
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize
    for (const node of nodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // Build graph
    for (const edge of edges) {
      const sources = adjacency.get(edge.source) || [];
      sources.push(edge.target);
      adjacency.set(edge.source, sources);
      
      const currentInDegree = inDegree.get(edge.target) || 0;
      inDegree.set(edge.target, currentInDegree + 1);
    }

    // Kahn's algorithm
    const queue: string[] = [];
    const result: WorkflowTemplate['nodes'] = [];

    // Find all nodes with no incoming edges
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        result.push(node);
      }

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighborId of neighbors) {
        const currentDegree = inDegree.get(neighborId)! - 1;
        inDegree.set(neighborId, currentDegree);
        if (currentDegree === 0) {
          queue.push(neighborId);
        }
      }
    }

    // Check for cycles
    if (result.length !== nodes.length) {
      console.warn('[Executor] Workflow has cycles, using original order');
      return nodes;
    }

    return result;
  }

  /**
   * Get execution results
   */
  getResults(): Map<string, NodeExecutionResult> {
    return this.nodeResults;
  }
}

/**
 * Execute workflow helper function
 */
export async function executeWorkflow(
  workflowId: string,
  workflowName: string,
  nodes: WorkflowTemplate['nodes'],
  edges: WorkflowTemplate['edges'],
  initialData: Record<string, any> = {}
): Promise<ExecutionResult> {
  const engine = new WorkflowExecutionEngine(workflowId, workflowName, initialData);
  const result = await engine.execute(nodes, edges);
  
  // Log to database if available
  if (process.env.DATABASE_URL) {
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Create execution record
      await prisma.execution.create({
        data: {
          workflowId: workflowId,
          userId: 'demo-user', // TODO: Get from auth
          status: result.success ? 'completed' : 'failed',
          result: result.output,
          error: result.error,
        },
      });
      
      console.log('[ExecutionEngine] Logged to database');
      await prisma.$disconnect();
    } catch (error) {
      console.error('[ExecutionEngine] Failed to log to database:', error);
      // Don't throw - execution already completed
    }
  }
  
  return result;
}
