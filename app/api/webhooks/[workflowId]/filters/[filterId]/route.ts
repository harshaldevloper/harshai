import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { workflowId: string; filterId: string } }) {
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
    const filter = await prisma.webhookFilter.update({
      where: { id: params.filterId, workflowId: params.workflowId },
      data: body,
    });
    
    return NextResponse.json({ success: true, filter });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { workflowId: string; filterId: string } }) {
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
    
    await prisma.webhookFilter.delete({
      where: { id: params.filterId, workflowId: params.workflowId },
    });
    
    return NextResponse.json({ success: true, message: 'Filter deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
