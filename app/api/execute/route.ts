import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/lib/execution-engine';
import { getTemplateById } from '@/lib/templates';

/**
 * POST /api/execute - Execute a workflow
 * 
 * Request body:
 * - workflowId: string (template ID or custom workflow ID)
 * - nodes: array (optional, for custom workflows)
 * - edges: array (optional, for custom workflows)
 * - data: object (initial data for the workflow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, nodes, edges, data = {} } = body;

    if (!workflowId && (!nodes || !edges)) {
      return NextResponse.json(
        { error: 'Either workflowId or nodes/edges must be provided' },
        { status: 400 }
      );
    }

    // Get workflow definition
    let workflowNodes, workflowEdges, workflowName;

    if (workflowId) {
      // Try to load from templates
      const template = getTemplateById(workflowId);
      if (template) {
        workflowNodes = template.nodes;
        workflowEdges = template.edges;
        workflowName = template.name;
      } else {
        // Try to load from database (future implementation)
        return NextResponse.json(
          { error: `Workflow template "${workflowId}" not found` },
          { status: 404 }
        );
      }
    } else {
      // Use provided nodes/edges
      workflowNodes = nodes;
      workflowEdges = edges;
      workflowName = 'Custom Workflow';
    }

    console.log(`[API] Executing workflow: ${workflowName}`);
    console.log(`[API] Nodes: ${workflowNodes.length}, Edges: ${workflowEdges.length}`);

    // Execute the workflow
    const result = await executeWorkflow(
      workflowId || 'custom',
      workflowName,
      workflowNodes,
      workflowEdges,
      data
    );

    console.log(`[API] Execution completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`[API] Execution time: ${result.executionTime}ms`);
    console.log(`[API] Steps executed: ${result.stepsExecuted}`);

    // Return result
    return NextResponse.json({
      success: result.success,
      output: result.output,
      executionTime: result.executionTime,
      stepsExecuted: result.stepsExecuted,
      error: result.error,
    });
  } catch (error) {
    console.error('[API] Workflow execution failed:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Workflow execution failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/execute - Get execution history (future implementation)
 */
export async function GET(request: NextRequest) {
  // Future: Return execution history from database
  return NextResponse.json({
    message: 'Execution history endpoint - coming soon',
    executions: [],
  });
}
