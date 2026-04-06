import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { rateTemplate } from '@/lib/template-marketplace';

/**
 * POST /api/templates/[templateId]/rate
 * Rate a template (1-5 stars)
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
    const { rating } = body;

    if (!rating || typeof rating !== 'number') {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      );
    }

    const template = await rateTemplate(templateId, user.id, rating);

    return NextResponse.json({
      success: true,
      rating: template.rating,
      ratingCount: template.ratingCount
    });
  } catch (error: any) {
    console.error('Error rating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rate template' },
      { status: error.message.includes('must be between') ? 400 : 500 }
    );
  }
}
