/**
 * POST /api/integrations/google-sheets/test
 * Test Google Sheets API connection
 */

import { NextResponse } from 'next/server';
import { testGoogleSheetsConnection } from '@/lib/integrations/google-sheets';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      return NextResponse.json({
        success: true,
        message: '✅ Test Mode Active - Google Sheets ready (mock responses)',
        testMode: true,
        mockData: [['Name', 'Email'], ['John', 'john@example.com']],
      });
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 400 }
      );
    }
    
    const result = await testGoogleSheetsConnection(apiKey);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
