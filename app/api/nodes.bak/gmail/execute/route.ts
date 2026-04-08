/**
 * POST /api/nodes/gmail/execute
 * Execute Gmail send email node
 */

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/integrations/gmail';

export async function POST(request: Request) {
  try {
    const { config, input } = await request.json();
    
    // Check if TEST_MODE is enabled
    const testMode = process.env.TEST_MODE === 'true';
    
    if (testMode) {
      // In test mode, return mock response
      console.log('[Gmail Execute] TEST_MODE enabled - returning mock email sent');
      return NextResponse.json({
        success: true,
        testMode: true,
        output: {
          messageId: 'mock-message-' + Date.now(),
          threadId: 'mock-thread-' + Date.now(),
          to: input?.to || 'test@example.com',
          subject: input?.subject || 'Test Email',
          message: 'Email sent successfully (mock - test mode)',
        },
      });
    }
    
    if (!config?.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Gmail access token required' },
        { status: 400 }
      );
    }
    
    if (!input?.to || !input?.subject || !input?.body) {
      return NextResponse.json(
        { success: false, error: 'To, subject, and body are required' },
        { status: 400 }
      );
    }
    
    const result = await sendEmail(
      {
        to: input.to,
        subject: input.subject,
        body: input.body,
        html: input.html || false,
      },
      {
        accessToken: config.accessToken,
        userId: config.userId,
      }
    );
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('[Gmail Execute] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
