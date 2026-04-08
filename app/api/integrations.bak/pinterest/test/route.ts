/**
 * POST /api/integrations/pinterest/test
 * Test Pinterest API connection
 */

import { NextResponse } from 'next/server';
import { testPinterestConnection } from '@/lib/integrations/pinterest';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Pinterest Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Pinterest integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          pinId: 'mock-pin-123',
          url: 'https://pinterest.com/pin/mock-123',
        }
      });
    }
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Access token is required. Enable TEST_MODE or provide a token.' },
        { status: 400 }
      );
    }
    
    const result = await testPinterestConnection(accessToken);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Pinterest Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
