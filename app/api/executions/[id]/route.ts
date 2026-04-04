// HarshAI - Single Execution API
// Day 27: Execution History UI

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/executions/[id] - Get single execution details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id;
    
    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            nodes: true,
            edges: true
          }
        }
      }
    });
    
    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }
    
    // Calculate duration
    const duration = execution.completedAt && execution.startedAt
      ? execution.completedAt.getTime() - execution.startedAt.getTime()
      : null;
    
    return NextResponse.json({
      ...execution,
      duration,
      workflow: execution.workflow
    });
    
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}
