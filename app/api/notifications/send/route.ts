/**
 * Send Notification API
 * POST /api/notifications/send - Trigger email notification
 * 
 * This endpoint is called internally by the workflow execution engine
 * to send notifications based on user preferences.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  sendWorkflowStartedEmail,
  sendWorkflowCompletedEmail,
  sendWorkflowFailedEmail,
  isEmailServiceConfigured
} from '@/lib/email-service';

const prisma = new PrismaClient();

export interface SendNotificationRequest {
  executionId: string;
  workflowId: string;
  workflowName: string;
  userId: string;
  type: 'start' | 'success' | 'failure';
  executionTime?: number;
  stepsExecuted?: number;
  errorMessage?: string;
}

/**
 * POST /api/notifications/send
 * Send notification based on workflow execution status
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API secret for internal calls
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.CRON_SECRET || process.env.API_SECRET;
    
    if (apiSecret && authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SendNotificationRequest = await request.json();
    const {
      executionId,
      workflowId,
      workflowName,
      userId,
      type,
      executionTime,
      stepsExecuted,
      errorMessage
    } = body;

    // Validate required fields
    if (!executionId || !workflowId || !workflowName || !userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!isEmailServiceConfigured()) {
      console.warn('[Notifications] Email service not configured, logging notification only');
      // Still log the notification even if email service is not configured
      await logNotification(userId, executionId, type, 'skipped', 'Email service not configured');
      return NextResponse.json({
        success: false,
        message: 'Email service not configured',
        notificationLogged: true
      });
    }

    // Get user notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find workflow-specific preferences, fall back to global preferences
    let preferences = user.notificationPreferences.find(
      (pref: any) => pref.workflowId === workflowId
    );

    if (!preferences) {
      // Fall back to global preferences (workflowId is null)
      preferences = user.notificationPreferences.find(
        (pref: any) => pref.workflowId === null
      );
    }

    // Default preferences if none exist
    if (!preferences) {
      preferences = {
        emailEnabled: true,
        smsEnabled: false,
        notifyOnSuccess: true,
        notifyOnFailure: true,
        notifyOnStart: false,
        emailAddress: user.email
      } as any;
    }

    // Type assertion - preferences is guaranteed to exist after fallback
    const prefs = preferences as any;

    // Check if email is enabled for this notification type
    const shouldNotify = {
      start: prefs.notifyOnStart && prefs.emailEnabled,
      success: prefs.notifyOnSuccess && prefs.emailEnabled,
      failure: prefs.notifyOnFailure && prefs.emailEnabled
    };

    if (!shouldNotify[type]) {
      console.log(`[Notifications] Notification ${type} disabled for user ${userId}`);
      return NextResponse.json({
        success: true,
        message: 'Notification disabled by user preferences',
        emailSent: false
      });
    }

    // Send appropriate email
    let result;
    switch (type) {
      case 'start':
        result = await sendWorkflowStartedEmail(prefs.emailAddress, {
          workflowName,
          workflowId,
          userName: user.name || undefined,
          executionId
        });
        break;
      case 'success':
        result = await sendWorkflowCompletedEmail(prefs.emailAddress, {
          workflowName,
          workflowId,
          userName: user.name || undefined,
          executionId,
          status: 'completed',
          executionTime,
          stepsExecuted
        });
        break;
      case 'failure':
        result = await sendWorkflowFailedEmail(prefs.emailAddress, {
          workflowName,
          workflowId,
          userName: user.name || undefined,
          executionId,
          status: 'failed',
          errorMessage: errorMessage || 'Unknown error',
          troubleshootingTips: [
            'Check your API keys and credentials in the workflow settings',
            'Verify that all connections are properly configured',
            'Review the error message above for specific details',
            'Try running the workflow manually from the dashboard',
            'Contact support if the issue persists'
          ]
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    // Log notification to database
    await logNotification(
      userId,
      executionId,
      type,
      result.success ? 'sent' : 'failed',
      result.error
    );

    if (result.success) {
      console.log(`[Notifications] Email sent successfully to ${prefs.emailAddress}`);
      return NextResponse.json({
        success: true,
        emailSent: true,
        emailId: result.id,
        recipient: prefs.emailAddress
      });
    } else {
      console.error(`[Notifications] Failed to send email: ${result.error}`);
      return NextResponse.json({
        success: false,
        emailSent: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Notifications] Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Log notification to database
 */
async function logNotification(
  userId: string,
  executionId: string,
  type: 'start' | 'success' | 'failure',
  status: 'sent' | 'failed' | 'skipped',
  error?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        executionId,
        type,
        status,
        error: error || null,
        sentAt: new Date()
      }
    });
  } catch (logError) {
    console.error('[Notifications] Failed to log notification:', logError);
    // Don't throw - logging failure shouldn't break the main flow
  }
}
