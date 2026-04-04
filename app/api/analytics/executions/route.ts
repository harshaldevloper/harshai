// HarshAI - Analytics Executions API
// GET /api/analytics/executions - Execution history with filters

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { getExecutionsWithFilters } from '@/lib/analytics';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { searchParams } = new URL(request.url);

    const workflowId = searchParams.get('workflowId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const result = await getExecutionsWithFilters(userId, {
      workflowId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
