import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { testFilters } from '@/lib/webhook-filter-engine';

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { workflowId: string } }) {
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
    
    const { payload } = await request.json();
    const result = await testFilters(params.workflowId, payload);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
