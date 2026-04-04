// HarshAI - Analytics Summary API
// GET /api/analytics/summary - Overall stats

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { getAnalyticsSummary } from '@/lib/analytics';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID from Clerk
    const userId = user.id;

    const summary = await getAnalyticsSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}
