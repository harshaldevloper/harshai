import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { getWebhookAnalytics } from '@/lib/webhook-analytics';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { workflowId: string } }) {
  try {
    const { userId } = getAuth(request as any);
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const workflow = await prisma.workflow.findUnique({
      where: { id: params.workflowId },
      select: { id: true, userId: true },
    });
    
    if (!workflow || workflow.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const analytics = await getWebhookAnalytics(params.workflowId, days);
    
    return NextResponse.json({ success: true, ...analytics });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
