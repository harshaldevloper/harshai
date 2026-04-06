import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { favoriteTemplate } from '@/lib/template-marketplace';

/**
 * POST /api/templates/[templateId]/favorite
 * Favorite or unfavorite a template
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

    const result = await favoriteTemplate(templateId, user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error favoriting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to favorite template' },
      { status: 500 }
    );
  }
}
