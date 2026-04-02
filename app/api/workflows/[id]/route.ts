import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/workflows/:id - Get single workflow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings back to objects
    const parsedWorkflow = {
      ...workflow,
      nodes: JSON.parse(workflow.nodes as string),
      edges: JSON.parse(workflow.edges as string),
    };

    return NextResponse.json(parsedWorkflow);
  } catch (error) {
    console.error('[API] Failed to fetch workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workflows/:id - Delete workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.workflow.delete({
      where: { id: params.id },
    });

    console.log('[API] Deleted workflow:', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Failed to delete workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
