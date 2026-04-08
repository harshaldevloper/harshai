/**
 * POST /api/integrations/[name]/connect
 * Start OAuth flow for integration
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    
    // Integration OAuth flow coming soon
    return NextResponse.json({ 
      error: 'OAuth integration setup coming soon. Please use Test Mode for now.' 
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
