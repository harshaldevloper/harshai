// HarshAI - Analytics Trends API
// GET /api/analytics/trends - 7-day trend data

import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import { getExecutionTrends } from '@/lib/analytics';

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
    const days = parseInt(searchParams.get('days') || '7');

    const trends = await getExecutionTrends(userId, days);

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
