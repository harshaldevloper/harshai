// HarshAI - Execution History API
// Day 27: Execution History UI

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/executions - List executions with filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    
    // Build where clause
    const where: any = {};
    
    if (workflowId) {
      where.workflowId = workflowId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    // Get total count
    const total = await prisma.execution.count({ where });
    
    // Get executions with pagination
    const executions = await prisma.execution.findMany({
      where,
      include: {
        workflow: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Calculate duration for each execution
    const executionsWithDuration = executions.map((exec: any) => {
      const duration = exec.completedAt && exec.startedAt
        ? exec.completedAt.getTime() - exec.startedAt.getTime()
        : null;
      
      return {
        ...exec,
        duration,
        workflow: exec.workflow
      };
    });
    
    return NextResponse.json({
      executions: executionsWithDuration,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
