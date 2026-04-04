/**
 * Email Delivery Webhook
 * POST /api/webhooks/email-delivery - Handle email service webhooks
 * 
 * Receives delivery status updates from Resend (or other email providers)
 * to track email delivery, opens, clicks, bounces, and complaints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced' | 'email.complained';
  created_at: string;
  data: {
    email_id: string;
    to: string;
    from: string;
    subject: string;
    created_at: string;
    // Additional fields depending on event type
    error?: string;
    url?: string;
    ip?: string;
    user_agent?: string;
  };
}

/**
 * POST /api/webhooks/email-delivery
 * Handle email delivery webhook events from Resend
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (Resend sends a webhook secret)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-resend-signature');
      // In production, verify the signature using crypto
      // For now, we'll skip signature verification
      console.log('[Webhook] Received webhook event');
    }

    const body: ResendWebhookEvent = await request.json();
    const { type, created_at, data } = body;

    console.log(`[Webhook] Processing event: ${type} for email ${data.email_id}`);

    // Find the notification by email ID
    const notification = await prisma.notification.findFirst({
      where: {
        metadata: {
          path: ['emailId'],
          equals: data.email_id
        }
      }
    });

    if (!notification) {
      console.log(`[Webhook] Notification not found for email ${data.email_id}`);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ received: true });
    }

    // Update notification status based on event type
    let status = notification.status;
    let metadata = notification.metadata as any || {};

    switch (type) {
      case 'email.sent':
        status = 'sent';
        metadata.sentAt = created_at;
        break;
      case 'email.delivered':
        status = 'delivered';
        metadata.deliveredAt = created_at;
        break;
      case 'email.opened':
        metadata.openedAt = created_at;
        metadata.openCount = (metadata.openCount || 0) + 1;
        break;
      case 'email.clicked':
        metadata.clickedAt = created_at;
        metadata.clickCount = (metadata.clickCount || 0) + 1;
        if (data.url) {
          metadata.clickedUrl = data.url;
        }
        break;
      case 'email.bounced':
        status = 'bounced';
        metadata.bouncedAt = created_at;
        metadata.bounceReason = data.error;
        break;
      case 'email.complained':
        status = 'complained';
        metadata.complainedAt = created_at;
        break;
    }

    // Update notification in database
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: status as any,
        metadata
      }
    });

    console.log(`[Webhook] Updated notification ${notification.id} to status: ${status}`);

    return NextResponse.json({
      received: true,
      notificationId: notification.id,
      newStatus: status
    });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    // Return 200 anyway to prevent retry loops for malformed events
    return NextResponse.json({ received: true, error: 'Processing error' });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/webhooks/email-delivery
 * Get webhook configuration status
 */
export async function GET() {
  try {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const hasSecret = !!webhookSecret;

    // Get recent webhook events
    const recentNotifications = await prisma.notification.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
      where: {
        metadata: {
          path: ['emailId'],
          not: null
        }
      }
    });

    return NextResponse.json({
      status: 'ok',
      webhookConfigured: hasSecret,
      recentEvents: recentNotifications.map((n: any) => ({
        id: n.id,
        type: n.type,
        status: n.status,
        sentAt: n.sentAt,
        metadata: n.metadata
      }))
    });

  } catch (error) {
    console.error('[Webhook] Status check failed:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
