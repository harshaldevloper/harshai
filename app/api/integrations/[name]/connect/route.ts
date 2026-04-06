/**
 * POST /api/integrations/[name]/connect
 * Start OAuth flow for integration
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { integrationRegistry } from '@/lib/integrations/registry';

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
    const integration = integrationRegistry.getIntegration(name);
    
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const { redirectUri } = await request.json();
    
    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
    
    const authUrl = integration.getAuthUrl(userId, redirectUri, state);
    
    return NextResponse.json({ authUrl, state });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
