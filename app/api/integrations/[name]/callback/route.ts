/**
 * GET /api/integrations/[name]/callback
 * OAuth callback handler
 */

import { NextResponse } from 'next/server';
import { integrationRegistry } from '@/lib/integrations/registry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      return NextResponse.redirect(
        new URL(`/integrations/error?error=${error}`, request.url)
      );
    }
    
    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
    }
    
    const integration = integrationRegistry.getIntegration(name);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }
    
    // Decode state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state!, 'base64').toString());
      userId = stateData.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }
    
    // Connect integration
    const connection = await integration.connect(userId, code);
    
    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/integrations/success?name=${name}&account=${connection.accountName}`, request.url)
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/integrations/error?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
