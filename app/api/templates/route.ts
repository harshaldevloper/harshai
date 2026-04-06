import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import {
  createTemplate,
  getPublicTemplates,
  getCategories,
  getDifficultyLevels
} from '@/lib/template-marketplace';

/**
 * GET /api/templates
 * List public templates with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') as any || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    const result = await getPublicTemplates(filters);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template from workflow
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      workflowId,
      name,
      description,
      category,
      difficulty,
      visibility,
      tags,
      thumbnail,
      variables
    } = body;

    // Validate required fields
    if (!workflowId || !name || !category || !difficulty || !visibility) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = getCategories();
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = getDifficultyLevels();
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Validate visibility
    const validVisibility = ['private', 'public', 'unlisted'];
    if (!validVisibility.includes(visibility)) {
      return NextResponse.json(
        { error: 'Invalid visibility' },
        { status: 400 }
      );
    }

    const template = await createTemplate({
      workflowId,
      name,
      description,
      category,
      difficulty: difficulty as any,
      visibility: visibility as any,
      tags: tags || [],
      thumbnail,
      variables,
      authorId: user.id
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}
