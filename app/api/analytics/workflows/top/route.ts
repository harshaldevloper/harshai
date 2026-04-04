// HarshAI - Top Workflows API
// GET /api/analytics/workflows/top - Top workflows by execution count

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { getTopWorkflows } from '@/lib/analytics';

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
    const limit = parseInt(searchParams.get('limit') || '5');

    const workflows = await getTopWorkflows(userId, limit);

    return NextResponse.json({ workflows });
  } catch (error) {
    console.error('Error fetching top workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top workflows' },
      { status: 500 }
    );
  }
}
