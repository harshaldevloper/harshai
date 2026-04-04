/**
 * Email Service - HarshAI Notification System
 * Uses Resend.com for email delivery (free tier: 3K emails/month)
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || 'notifications@harshai.app';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WorkflowEmailData {
  workflowName: string;
  workflowId: string;
  userName?: string;
  executionId?: string;
  status?: 'started' | 'completed' | 'failed';
  executionTime?: number;
  stepsExecuted?: number;
  errorMessage?: string;
  troubleshootingTips?: string[];
}

/**
 * Send workflow started email
 */
export async function sendWorkflowStartedEmail(
  to: string,
  data: WorkflowEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[EmailService] Resend not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const subject = `🚀 Your workflow '${data.workflowName}' is now running`;
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Started</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px;">
                <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #1f2937;">
                  🚀 Workflow Started
                </h1>
                
                <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Hi${data.userName ? ` ${data.userName}` : ''},
                </p>
                
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Your workflow <strong style="color: #1f2937;">"${data.workflowName}"</strong> has started running.
                </p>
                
                <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Workflow ID:</strong> ${data.workflowId}<br>
                    <strong>Started at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
                  </p>
                </div>
                
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  We'll send you another email when the workflow completes.
                </p>
                
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                  — The HarshAI Team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  const text = `
Workflow Started

Hi${data.userName ? ` ${data.userName}` : ''},

Your workflow "${data.workflowName}" has started running.

Workflow ID: ${data.workflowId}
Started at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST

We'll send you another email when the workflow completes.

— The HarshAI Team
  `.trim();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailService] Workflow started email sent to ${to}`, result);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('[EmailService] Failed to send workflow started email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send workflow completed email
 */
export async function sendWorkflowCompletedEmail(
  to: string,
  data: WorkflowEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[EmailService] Resend not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const subject = `✅ '${data.workflowName}' completed successfully`;
  
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Completed</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px;">
                <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #059669;">
                  ✅ Workflow Completed
                </h1>
                
                <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Hi${data.userName ? ` ${data.userName}` : ''},
                </p>
                
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Great news! Your workflow <strong style="color: #1f2937;">"${data.workflowName}"</strong> has completed successfully.
                </p>
                
                <div style="background-color: #f0fdf4; border: 1px solid #86efac; padding: 20px; margin: 24px 0; border-radius: 8px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #166534;">
                    Execution Summary
                  </h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${data.executionTime ? `
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong>Execution Time:</strong></td>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151; text-align: right;">${(data.executionTime / 1000).toFixed(2)}s</td>
                    </tr>
                    ` : ''}
                    ${data.stepsExecuted ? `
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong>Steps Executed:</strong></td>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151; text-align: right;">${data.stepsExecuted}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong>Workflow ID:</strong></td>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151; text-align: right;">${data.workflowId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151;"><strong>Completed at:</strong></td>
                      <td style="padding: 8px 0; font-size: 14px; color: #374151; text-align: right;">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                  — The HarshAI Team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  const text = `
Workflow Completed ✅

Hi${data.userName ? ` ${data.userName}` : ''},

Great news! Your workflow "${data.workflowName}" has completed successfully.

Execution Summary:
${data.executionTime ? `- Execution Time: ${(data.executionTime / 1000).toFixed(2)}s` : ''}
${data.stepsExecuted ? `- Steps Executed: ${data.stepsExecuted}` : ''}
- Workflow ID: ${data.workflowId}
- Completed at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST

— The HarshAI Team
  `.trim();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailService] Workflow completed email sent to ${to}`, result);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('[EmailService] Failed to send workflow completed email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send workflow failed email
 */
export async function sendWorkflowFailedEmail(
  to: string,
  data: WorkflowEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[EmailService] Resend not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  const subject = `❌ '${data.workflowName}' failed`;
  
  const troubleshootingTips = data.troubleshootingTips || [
    'Check your API keys and credentials in the workflow settings',
    'Verify that all connections are properly configured',
    'Review the error message above for specific details',
    'Try running the workflow manually from the dashboard',
    'Contact support if the issue persists',
  ];

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Failed</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 40px 32px;">
                <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #dc2626;">
                  ❌ Workflow Failed
                </h1>
                
                <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Hi${data.userName ? ` ${data.userName}` : ''},
                </p>
                
                <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #4b5563;">
                  Unfortunately, your workflow <strong style="color: #1f2937;">"${data.workflowName}"</strong> encountered an error.
                </p>
                
                <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; margin: 24px 0; border-radius: 8px;">
                  <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #991b1b;">
                    Error Details
                  </h2>
                  <div style="background-color: #ffffff; padding: 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; color: #dc2626; word-break: break-word;">
                    ${data.errorMessage || 'Unknown error occurred'}
                  </div>
                  <div style="margin-top: 16px; font-size: 14px; color: #6b7280;">
                    <strong>Workflow ID:</strong> ${data.workflowId}<br>
                    <strong>Failed at:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
                  </div>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; margin: 24px 0; border-radius: 8px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #374151;">
                    💡 Troubleshooting Tips
                  </h2>
                  <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    ${troubleshootingTips.map(tip => `<li>${tip}</li>`).join('')}
                  </ul>
                </div>
                
                <p style="margin: 0; font-size: 14px; color: #9ca3af;">
                  — The HarshAI Team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  const text = `
Workflow Failed ❌

Hi${data.userName ? ` ${data.userName}` : ''},

Unfortunately, your workflow "${data.workflowName}" encountered an error.

Error Details:
${data.errorMessage || 'Unknown error occurred'}

Workflow ID: ${data.workflowId}
Failed at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST

Troubleshooting Tips:
${troubleshootingTips.map(tip => `- ${tip}`).join('\n')}

— The HarshAI Team
  `.trim();

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailService] Workflow failed email sent to ${to}`, result);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('[EmailService] Failed to send workflow failed email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Send any notification email (generic)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn('[EmailService] Resend not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailService] Email sent to ${to}`, result);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!resend && !!process.env.RESEND_API_KEY;
}

export { resend };
