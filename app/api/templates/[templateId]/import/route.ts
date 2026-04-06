import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { importTemplate } from '@/lib/template-marketplace';

/**
 * POST /api/templates/[templateId]/import
 * Import template to user's workflows
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { templateId } = await params;
    const body = await request.json();
    const { variables, workflowName } = body;

    const workflow = await importTemplate({
      templateId,
      userId: user.id,
      variables,
      workflowName
    });

    return NextResponse.json({
      success: true,
      workflow
    });
  } catch (error: any) {
    console.error('Error importing template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import template' },
      { status: error.message.includes('not found') || error.message.includes('not accessible') ? 404 : 500 }
    );
  }
}
