/**
 * GET /api/users/me/connections
 * List user's integration connections
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get Clerk user to get our internal user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const connections = await prisma.integrationConnection.findMany({
      where: { userId: user.id },
      include: {
        integration: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Mask sensitive data
    const maskedConnections = connections.map(conn => ({
      id: conn.id,
      integrationId: conn.integrationId,
      integrationName: conn.integration.name,
      accountName: conn.accountName,
      status: conn.status,
      scopes: conn.scopes,
      createdAt: conn.createdAt,
      lastUsedAt: conn.lastUsedAt,
      tokenExpiry: conn.tokenExpiry,
    }));
    
    return NextResponse.json({ connections: maskedConnections });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
