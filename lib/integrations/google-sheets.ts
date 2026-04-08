/**
 * Google Sheets Integration
 * Read/write spreadsheet data
 */

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface GoogleSheetsConfig {
  apiKey: string;
  spreadsheetId: string;
  testMode?: boolean;
}

export interface SheetRange {
  range: string;
  values: any[][];
}

export interface SheetsResponse {
  success: boolean;
  data?: any[][];
  updatedCells?: number;
  error?: string;
}

/**
 * Read data from Google Sheets
 */
export async function readSheet(
  spreadsheetId: string,
  range: string,
  apiKey: string,
  testMode: boolean = false
): Promise<SheetsResponse> {
  try {
    // Test Mode - return mock response without API call
    if (testMode) {
      console.log('[Google Sheets] Test Mode: Simulating read operation');
      return {
        success: true,
        data: [['Test', 'Data'], ['Row', '2']],
      };
    }

    // Validate API key for live mode
    if (!apiKey) {
      return {
        success: false,
        error: 'Google Sheets API key is required. Add it in Settings > Integrations or enable Test Mode.',
      };
    }

    const url = `${SHEETS_API_URL}/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Google Sheets API error: ${error.error?.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result.values || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to read sheet',
    };
  }
}

/**
 * Write data to Google Sheets
 */
export async function writeSheet(
  spreadsheetId: string,
  range: string,
  values: any[][],
  apiKey: string
): Promise<SheetsResponse> {
  try {
    const url = `${SHEETS_API_URL}/${spreadsheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Google Sheets API error: ${error.error?.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      updatedCells: result.updatedCells,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to write sheet',
    };
  }
}

/**
 * Append data to Google Sheets
 */
export async function appendSheet(
  spreadsheetId: string,
  range: string,
  values: any[][],
  apiKey: string
): Promise<SheetsResponse> {
  try {
    const url = `${SHEETS_API_URL}/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: `Google Sheets API error: ${error.error?.message || response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      updatedCells: result.updates?.updatedCells || 0,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to append sheet',
    };
  }
}

/**
 * Test Google Sheets API connection
 */
export async function testGoogleSheetsConnection(apiKey: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Test with a simple API call
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets?pageSize=1&key=${apiKey}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Connection failed: ${response.statusText}`,
      };
    }

    return {
      success: true,
      message: '✅ Connected to Google Sheets API',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
    };
  }
}
