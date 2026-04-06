import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { manualRetry } from '@/lib/webhook-retry-engine';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string; logId: string } }
) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const webhookLog = await prisma.webhookLog.findUnique({
      where: { id: params.logId },
      include: { workflow: { select: { userId: true } } },
    });
    
    if (!webhookLog || webhookLog.workflow.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    const result = await manualRetry(params.logId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Retry scheduled',
        deliveryId: result.deliveryId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
