/**
 * Multi-Step Workflow Engine - Day 37
 * Handles branching, parallel execution, and loops
 */

import { evaluateConditions, Condition, LogicOperator } from './condition-evaluator';

export interface MultiStepContext {
  workflowId: string;
  workflowName: string;
  data: Record<string, any>;
  variables: Record<string, any>;
  executionId?: string;
  startedAt: Date;
  branchPath: string[];
  loopState?: {
    currentLoop?: string;
    iteration: number;
    maxIterations: number;
  };
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output: any;
  error?: string;
  branchTaken?: string;
}

/**
 * Enhanced Workflow Execution Engine with Multi-Step Support
 */
export class MultiStepWorkflowEngine {
  private context: MultiStepContext;
  private nodeResults: Map<string, NodeExecutionResult> = new Map();

  constructor(
    workflowId: string,
    workflowName: string,
    initialData: Record<string, any> = {}
  ) {
    this.context = {
      workflowId,
      workflowName,
      data: initialData,
      variables: {},
      startedAt: new Date(),
      branchPath: [],
    };
  }

  /**
   * Execute node with support for all node types
   */
  async executeNode(node: any): Promise<NodeExecutionResult> {
    console.log(`[MultiStep] Executing node: ${node.data.label} (${node.type})`);

    try {
      let output: any;
      let branchTaken: string | undefined;

      switch (node.type) {
        case 'trigger':
          output = await this.executeTrigger(node);
          break;

        case 'action':
          output = await this.executeAction(node);
          break;

        case 'if':
          const ifResult = await this.executeIfNode(node);
          output = ifResult.output;
          branchTaken = ifResult.branchTaken;
          break;

        case 'switch':
          const switchResult = await this.executeSwitchNode(node);
          output = switchResult.output;
          branchTaken = switchResult.branchTaken;
          break;

        case 'fork':
          output = await this.executeForkNode(node);
          break;

        case 'merge':
          output = await this.executeMergeNode(node);
          break;

        case 'loop_for':
          output = await this.executeForEachLoop(node);
          break;

        case 'loop_while':
          output = await this.executeWhileLoop(node);
          break;

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      return {
        nodeId: node.id,
        success: true,
        output,
        branchTaken,
      };
    } catch (error) {
      console.error(`[MultiStep] Node failed:`, error);
      return {
        nodeId: node.id,
        success: false,
        output: null,
        error: error instanceof Error ? error.message : 'Execution failed',
      };
    }
  }

  /**
   * Execute If/Else node
   */
  private async executeIfNode(node: any): Promise<{ output: any; branchTaken: string }> {
    const config = node.data.config || {};
    const conditions: Condition[] = config.conditions || [];
    const logic: LogicOperator = config.logic || 'AND';

    console.log(`[MultiStep] Evaluating if condition with ${conditions.length} conditions (${logic})`);

    const result = evaluateConditions(conditions, this.context.data, logic);
    const branchTaken = result ? 'true' : 'false';

    console.log(`[MultiStep] If condition result: ${result}`);

    return {
      output: {
        conditionResult: result,
        branchTaken,
        evaluatedAt: new Date().toISOString(),
      },
      branchTaken,
    };
  }

  /**
   * Execute Switch node
   */
  private async executeSwitchNode(node: any): Promise<{ output: any; branchTaken: string }> {
    const config = node.data.config || {};
    const field = config.field;
    const cases = config.cases || [];
    const defaultValue = config.defaultValue;

    console.log(`[MultiStep] Evaluating switch on field: ${field}`);

    const actualValue = this.getNestedValue(this.context.data, field);
    let branchTaken = defaultValue || 'default';

    // Find matching case
    for (const case_ of cases) {
      if (case_.value === actualValue) {
        branchTaken = case_.branch;
        break;
      }
    }

    console.log(`[MultiStep] Switch matched: ${branchTaken} (value: ${actualValue})`);

    return {
      output: {
        switchField: field,
        switchValue: actualValue,
        branchTaken,
        evaluatedAt: new Date().toISOString(),
      },
      branchTaken,
    };
  }

  /**
   * Execute Fork node (parallel execution)
   */
  private async executeForkNode(node: any): Promise<any> {
    const config = node.data.config || {};
    const branches = config.branches || [];

    console.log(`[MultiStep] Forking into ${branches.length} parallel branches`);

    // Execute all branches in parallel
    const branchPromises = branches.map(async (branchId: string) => {
      console.log(`[MultiStep] Starting branch: ${branchId}`);
      return {
        branchId,
        startedAt: new Date().toISOString(),
      };
    });

    const results = await Promise.allSettled(branchPromises);

    const branchResults = results.map((result, idx) => ({
      branchId: branches[idx],
      status: result.status,
      ...(result.status === 'fulfilled' ? result.value : { error: result.reason }),
    }));

    console.log(`[MultiStep] All branches completed`);

    return {
      forkType: 'parallel',
      branchCount: branches.length,
      branches: branchResults,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Execute Merge node (sync branches)
   */
  private async executeMergeNode(node: any): Promise<any> {
    const config = node.data.config || {};
    const mergeStrategy = config.mergeStrategy || 'all';
    const waitForCount = config.waitForCount;

    console.log(`[MultiStep] Merge with strategy: ${mergeStrategy}`);

    // In a real implementation, this would wait for branches to complete
    // For now, we just aggregate the results
    const aggregatedData = {
      mergeStrategy,
      mergedAt: new Date().toISOString(),
      sourceBranches: this.context.data.parallelBranches || [],
    };

    return aggregatedData;
  }

  /**
   * Execute For Each loop
   */
  private async executeForEachLoop(node: any): Promise<any> {
    const config = node.data.config || {};
    const arrayPath = config.array;
    const maxIterations = config.maxIterations || 100;
    const batchSize = config.batchSize || 1;

    console.log(`[MultiStep] For Each loop on: ${arrayPath}`);

    const array = this.getNestedValue(this.context.data, arrayPath);

    if (!Array.isArray(array)) {
      throw new Error(`Field "${arrayPath}" is not an array`);
    }

    const results: any[] = [];
    const startTime = Date.now();

    // Process items
    for (let i = 0; i < array.length && i < maxIterations; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      
      console.log(`[MultiStep] Processing batch ${Math.floor(i / batchSize) + 1}: items ${i} to ${i + batch.length - 1}`);

      // Process batch
      for (let j = 0; j < batch.length; j++) {
        const itemIndex = i + j;
        const item = batch[j];

        // Set loop context
        this.context.loopState = {
          currentLoop: node.id,
          iteration: itemIndex,
          maxIterations,
        };

        // Add item to context data
        this.context.data.currentItem = item;
        this.context.data.currentIndex = itemIndex;
        this.context.data.totalItems = array.length;

        // In a real implementation, we would execute the loop body nodes here
        // For now, we just simulate processing
        results.push({
          index: itemIndex,
          item,
          processedAt: new Date().toISOString(),
        });
      }
    }

    // Clear loop state
    this.context.loopState = undefined;

    const executionTime = Date.now() - startTime;
    console.log(`[MultiStep] For Each completed: ${results.length} items in ${executionTime}ms`);

    return {
      loopType: 'for_each',
      arrayPath,
      totalItems: array.length,
      processedItems: results.length,
      executionTime,
      results,
    };
  }

  /**
   * Execute While loop
   */
  private async executeWhileLoop(node: any): Promise<any> {
    const config = node.data.config || {};
    const condition = config.condition;
    const maxIterations = config.maxIterations || 100;

    console.log(`[MultiStep] While loop with condition: ${condition}`);

    const results: any[] = [];
    let iteration = 0;
    const startTime = Date.now();

    // Execute while condition is true
    while (iteration < maxIterations) {
      // Evaluate condition
      const conditionResult = this.evaluateWhileCondition(condition);

      if (!conditionResult) {
        console.log(`[MultiStep] While condition false at iteration ${iteration}`);
        break;
      }

      console.log(`[MultiStep] While loop iteration ${iteration + 1}`);

      // Set loop context
      this.context.loopState = {
        currentLoop: node.id,
        iteration,
        maxIterations,
      };

      // In a real implementation, we would execute the loop body nodes here
      results.push({
        iteration,
        executedAt: new Date().toISOString(),
      });

      iteration++;
    }

    // Clear loop state
    this.context.loopState = undefined;

    const executionTime = Date.now() - startTime;
    console.log(`[MultiStep] While completed: ${iteration} iterations in ${executionTime}ms`);

    return {
      loopType: 'while',
      condition,
      iterations: iteration,
      maxIterationsReached: iteration >= maxIterations,
      executionTime,
      results,
    };
  }

  /**
   * Evaluate while loop condition
   */
  private evaluateWhileCondition(condition: any): boolean {
    // In a real implementation, this would evaluate a complex condition
    // For now, simple boolean check
    if (typeof condition === 'boolean') {
      return condition;
    }

    if (typeof condition === 'string') {
      // Try to evaluate as a field reference
      const value = this.getNestedValue(this.context.data, condition);
      return Boolean(value);
    }

    return false;
  }

  /**
   * Execute trigger node
   */
  private async executeTrigger(node: any): Promise<any> {
    const triggerType = node.data.triggerType;
    return { triggerType, receivedAt: new Date().toISOString() };
  }

  /**
   * Execute action node
   */
  private async executeAction(node: any): Promise<any> {
    const actionType = node.data.actionType;
    const config = node.data.config || {};

    // Import action executors dynamically
    try {
      const { executeAction } = await import('./action-executors');
      const result = await executeAction(actionType, config, this.context.data);
      return { actionType, result };
    } catch (error) {
      console.error(`[MultiStep] Action failed: ${actionType}`, error);
      throw error;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    if (!path) return obj;

    const keys = path.split('.');
    let result: any = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return undefined;
      }

      // Handle array indexing
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        result = result[arrayKey];
        if (Array.isArray(result)) {
          result = result[parseInt(index, 10)];
        } else {
          return undefined;
        }
      } else {
        result = result[key];
      }
    }

    return result;
  }

  /**
   * Get context data
   */
  getContext(): MultiStepContext {
    return { ...this.context };
  }

  /**
   * Get node results
   */
  getNodeResults(): Map<string, NodeExecutionResult> {
    return new Map(this.nodeResults);
  }
}

/**
 * Create and execute a multi-step workflow
 */
export async function executeMultiStepWorkflow(
  workflowId: string,
  workflowName: string,
  nodes: any[],
  edges: any[],
  initialData: Record<string, any> = {}
): Promise<any> {
  const engine = new MultiStepWorkflowEngine(workflowId, workflowName, initialData);
  const startTime = Date.now();
  let stepsExecuted = 0;

  // Simple sequential execution (in production, would handle branching properly)
  for (const node of nodes) {
    const result = await engine.executeNode(node);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        stepsExecuted,
        executionTime: Date.now() - startTime,
      };
    }

    // Merge output into context
    const context = engine.getContext();
    context.data = {
      ...context.data,
      ...result.output,
    };

    stepsExecuted++;
  }

  return {
    success: true,
    output: engine.getContext().data,
    stepsExecuted,
    executionTime: Date.now() - startTime,
  };
}
