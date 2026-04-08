/**
 * POST /api/auth/producthunt/callback
 * Handle Product Hunt OAuth callback
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    const API_KEY = process.env.PRODUCT_HUNT_API_KEY;
    const API_SECRET = process.env.PRODUCT_HUNT_API_SECRET;
    const REDIRECT_URI = process.env.PRODUCT_HUNT_REDIRECT_URI;

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: 'Product Hunt API credentials not configured' },
        { status: 500 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.producthunt.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
    });

  } catch (error: any) {
    console.error('[Product Hunt] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
