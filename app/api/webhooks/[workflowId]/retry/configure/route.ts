import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const workflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
      select: { id: true, userId: true },
    });
    
    if (!workflow || workflow.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { enabled, maxRetries, strategy, baseDelay } = body;
    
    await prisma.workflow.update({
      where: { id: params.workflowId },
      data: {
        webhookRetryEnabled: enabled,
        webhookMaxRetries: maxRetries,
        webhookRetryStrategy: strategy,
        webhookRetryBaseDelay: baseDelay,
      },
    });
    
    return NextResponse.json({ success: true, message: 'Retry configuration updated' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
