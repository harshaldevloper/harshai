/**
 * POST /api/integrations/notion/test
 * Test Notion API connection
 */

import { NextResponse } from 'next/server';
import { testNotionConnection } from '@/lib/integrations/notion';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Notion Test] TEST_MODE enabled - returning mock success');
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Notion integration ready (mock responses)',
        testMode: true,
        mockResponse: {
          pageId: 'mock-page-123',
          url: 'https://notion.so/mock-page',
        }
      });
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required. Enable TEST_MODE or provide an API key.' },
        { status: 400 }
      );
    }
    
    const result = await testNotionConnection(apiKey);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Notion Test] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
