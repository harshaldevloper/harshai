/**
 * POST /api/nodes/notion/execute
 * Execute Notion create page node
 */

import { NextResponse } from 'next/server';
import { createPage } from '@/lib/integrations/notion';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      console.log('[Notion Execute] TEST_MODE enabled - returning mock page created');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          pageId: 'mock-page-' + Date.now(),
          url: 'https://notion.so/mock-page-' + Date.now(),
          message: 'Page created successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.apiKey) {
      return NextResponse.json(
        { success: false, error: 'Notion API key required' },
        { status: 400 }
      );
    }
    
    if (!input?.properties || !config?.databaseId) {
      return NextResponse.json(
        { success: false, error: 'Properties and database ID required' },
        { status: 400 }
      );
    }
    
    const result = await createPage(input.properties, config);
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Notion Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
