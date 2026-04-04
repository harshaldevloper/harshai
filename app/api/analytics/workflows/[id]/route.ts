// HarshAI - Per-Workflow Analytics API
// GET /api/analytics/workflows/[id] - Per-workflow stats

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { getWorkflowStats } from '@/lib/analytics';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const workflowId = params.id;

    const stats = await getWorkflowStats(workflowId, userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    
    if (error instanceof Error && error.message === 'Workflow not found') {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch workflow stats' },
      { status: 500 }
    );
  }
}
