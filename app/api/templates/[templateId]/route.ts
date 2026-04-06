import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getTemplateById, updateTemplate, deleteTemplate } from '@/lib/template-marketplace';

/**
 * GET /api/templates/[templateId]
 * Get template details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { templateId } = await params;

    // Get user from database if authenticated
    let dbUserId: string | undefined;
    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });
      dbUserId = user?.id;
    }

    const template = await getTemplateById(templateId, dbUserId);

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: error.message === 'Template not found' ? 404 : 500 }
    );
  }
}

/**
 * PATCH /api/templates/[templateId]
 * Update template
 */
export async function PATCH(
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

    const template = await updateTemplate(templateId, user.id, body);

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: error.message === 'Unauthorized' || error.message === 'Template not found' ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/templates/[templateId]
 * Delete template
 */
export async function DELETE(
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

    await deleteTemplate(templateId, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: error.message === 'Unauthorized' || error.message === 'Template not found' ? 404 : 500 }
    );
  }
}
