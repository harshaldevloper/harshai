/**
 * Notification Preferences API
 * GET /api/notifications/preferences - Get user notification preferences
 * POST /api/notifications/preferences - Set user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

/**
 * GET /api/notifications/preferences
 * Get notification preferences for the current user
 * Query params: workflowId (optional) - get preferences for specific workflow
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const workflowId = searchParams.get('workflowId');

    let preferences;

    if (workflowId) {
      // Get preferences for specific workflow
      preferences = await prisma.notificationPreference.findFirst({
        where: {
          userId: user.id,
          workflowId: workflowId
        }
      });
    } else {
      // Get global preferences (workflowId is null)
      preferences = await prisma.notificationPreference.findFirst({
        where: {
          userId: user.id,
          workflowId: null
        }
      });
    }

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          emailEnabled: true,
          smsEnabled: false,
          notifyOnSuccess: true,
          notifyOnFailure: true,
          notifyOnStart: false,
          emailAddress: user.email,
          workflowId: workflowId || null
        }
      });
    }

    return NextResponse.json({
      preferences: {
        id: preferences.id,
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        notifyOnSuccess: preferences.notifyOnSuccess,
        notifyOnFailure: preferences.notifyOnFailure,
        notifyOnStart: preferences.notifyOnStart,
        emailAddress: preferences.emailAddress,
        workflowId: preferences.workflowId
      }
    });

  } catch (error) {
    console.error('[Notifications] GET preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/notifications/preferences
 * Set notification preferences for the current user
 * Body: {
 *   workflowId?: string | null,
 *   emailEnabled: boolean,
 *   smsEnabled: boolean,
 *   notifyOnSuccess: boolean,
 *   notifyOnFailure: boolean,
 *   notifyOnStart: boolean,
 *   emailAddress: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      workflowId = null,
      emailEnabled = true,
      smsEnabled = false,
      notifyOnSuccess = true,
      notifyOnFailure = true,
      notifyOnStart = false,
      emailAddress = user.email
    } = body;

    // Validate email address
    if (!emailAddress || !emailAddress.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Upsert preferences (create or update)
    const preferences = await prisma.notificationPreference.upsert({
      where: {
        userId_workflowId: {
          userId: user.id,
          workflowId: workflowId
        }
      },
      update: {
        emailEnabled,
        smsEnabled,
        notifyOnSuccess,
        notifyOnFailure,
        notifyOnStart,
        emailAddress
      },
      create: {
        userId: user.id,
        workflowId: workflowId,
        emailEnabled,
        smsEnabled,
        notifyOnSuccess,
        notifyOnFailure,
        notifyOnStart,
        emailAddress
      }
    });

    console.log(`[Notifications] Preferences updated for user ${userId}`, preferences);

    return NextResponse.json({
      success: true,
      preferences: {
        id: preferences.id,
        emailEnabled: preferences.emailEnabled,
        smsEnabled: preferences.smsEnabled,
        notifyOnSuccess: preferences.notifyOnSuccess,
        notifyOnFailure: preferences.notifyOnFailure,
        notifyOnStart: preferences.notifyOnStart,
        emailAddress: preferences.emailAddress,
        workflowId: preferences.workflowId
      }
    });

  } catch (error) {
    console.error('[Notifications] POST preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to set preferences' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
