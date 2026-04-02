import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/workflows - List all workflows for current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication (Clerk user ID)
    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('[API] Failed to fetch workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create or update a workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, nodes, edges, version } = body;

    // TODO: Add authentication (Clerk user ID)
    
    // Placeholder userId for development (replace with Clerk auth later)
    const userId = 'dev-user-001';
    
    if (id) {
      // Update existing workflow
      const workflow = await prisma.workflow.update({
        where: { id },
        data: {
          name,
          description,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges),
          version: version + 1,
        },
      });

      console.log('[API] Updated workflow:', id);
      return NextResponse.json(workflow);
    } else {
      // Create new workflow
      const workflow = await prisma.workflow.create({
        data: {
          userId,
          name,
          description: description || '',
          nodes: JSON.stringify(nodes || []),
          edges: JSON.stringify(edges || []),
          version: 1,
        },
      });

      console.log('[API] Created workflow:', workflow.id);
      return NextResponse.json(workflow, { status: 201 });
    }
  } catch (error) {
    console.error('[API] Failed to save workflow:', error);
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}
