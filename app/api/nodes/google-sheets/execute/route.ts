/**
 * POST /api/nodes/google-sheets/execute
 * Execute Google Sheets node
 */

import { NextResponse } from 'next/server';
import { readSheet, writeSheet, appendSheet } from '@/lib/integrations/google-sheets';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          data: [['Mock', 'Data'], ['Test', 'Mode']],
          message: 'Sheet operation completed (mock)',
        },
      });
    }
    
    if (!config?.apiKey || !config?.spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'API key and spreadsheet ID required' },
        { status: 400 }
      );
    }
    
    const { action, range, values } = input;
    
    if (action === 'read') {
      const result = await readSheet(config.spreadsheetId, range, config.apiKey);
      return NextResponse.json(result);
    } else if (action === 'write') {
      const result = await writeSheet(config.spreadsheetId, range, values, config.apiKey);
      return NextResponse.json(result);
    } else if (action === 'append') {
      const result = await appendSheet(config.spreadsheetId, range, values, config.apiKey);
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
