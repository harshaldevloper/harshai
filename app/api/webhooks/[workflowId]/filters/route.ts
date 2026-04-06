import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

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
    
    const filters = await prisma.webhookFilter.findMany({
      where: { workflowId: params.workflowId },
      orderBy: { priority: 'asc' },
    });
    
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

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
    
    const body = await request.json();
    const { filterType, field, operator, value, enabled = true, priority = 0 } = body;
    
    const filter = await prisma.webhookFilter.create({
      data: { workflowId: params.workflowId, filterType, field, operator, value, enabled, priority },
    });
    
    return NextResponse.json({ success: true, filter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
