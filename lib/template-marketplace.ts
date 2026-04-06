/**
 * Template Marketplace - Day 36
 * Save, share, and import workflow templates
 */

import { prisma } from './prisma';
import { WorkflowTemplate } from './templates';

export interface CreateTemplateInput {
  workflowId: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  visibility: 'private' | 'public' | 'unlisted';
  tags: string[];
  thumbnail?: string;
  variables?: TemplateVariableInput[];
}

export interface TemplateVariableInput {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'integration' | 'webhook';
  required?: boolean;
  defaultValue?: string;
  options?: any[];
}

export interface TemplateFilters {
  category?: string;
  difficulty?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'imports' | 'rating';
  page?: number;
  limit?: number;
}

export interface ImportTemplateInput {
  templateId: string;
  userId: string;
  variables?: Record<string, any>;
  workflowName?: string;
}

/**
 * Create a template from an existing workflow
 */
export async function createTemplate(input: CreateTemplateInput) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: input.workflowId },
    include: { user: true }
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  if (workflow.userId !== input.authorId) {
    throw new Error('Unauthorized');
  }

  const template = await prisma.template.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      difficulty: input.difficulty,
      visibility: input.visibility,
      thumbnail: input.thumbnail,
      tags: input.tags,
      nodes: workflow.nodes,
      edges: workflow.edges,
      variables: input.variables ? JSON.stringify(input.variables) : null,
      authorId: workflow.userId,
      workflowId: workflow.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Create template variables if provided
  if (input.variables && input.variables.length > 0) {
    await prisma.templateVariable.createMany({
      data: input.variables.map(v => ({
        templateId: template.id,
        name: v.name,
        label: v.label,
        type: v.type,
        required: v.required ?? false,
        defaultValue: v.defaultValue,
        options: v.options ? JSON.stringify(v.options) : null
      }))
    });
  }

  return template;
}

/**
 * Get public templates with filters
 */
export async function getPublicTemplates(filters: TemplateFilters = {}) {
  const {
    category,
    difficulty,
    search,
    sort = 'newest',
    page = 1,
    limit = 20
  } = filters;

  const where: any = {
    visibility: 'public'
  };

  if (category) {
    where.category = category;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }
    ];
  }

  let orderBy: any = {};
  switch (sort) {
    case 'oldest':
      orderBy.createdAt = 'asc';
      break;
    case 'imports':
      orderBy.imports = 'desc';
      break;
    case 'rating':
      orderBy.rating = 'desc';
      break;
    default:
      orderBy.createdAt = 'desc';
  }

  const skip = (page - 1) * limit;

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        variables_: true,
        _count: {
          select: {
            favorites: true
          }
        }
      }
    }),
    prisma.template.count({ where })
  ]);

  return {
    templates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: string, userId?: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      variables_: true,
      favorites: userId ? {
        where: { userId }
      } : false,
      _count: {
        select: {
          favorites: true
        }
      }
    }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check visibility
  if (template.visibility === 'private' && template.authorId !== userId) {
    throw new Error('Template not accessible');
  }

  return template;
}

/**
 * Import template to user's workflows
 */
export async function importTemplate(input: ImportTemplateInput) {
  const template = await prisma.template.findUnique({
    where: { id: input.templateId },
    include: {
      variables_: true
    }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // Check visibility
  if (template.visibility === 'private' && template.authorId !== input.userId) {
    throw new Error('Template not accessible');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: input.userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Apply variable substitutions if provided
  let nodes = template.nodes;
  let edges = template.edges;

  if (input.variables && template.variables_) {
    const nodesJson = JSON.parse(JSON.stringify(nodes));
    const templateVars = template.variables_;

    // Replace variable placeholders in nodes
    for (const node of nodesJson) {
      if (node.data?.config) {
        for (const [key, value] of Object.entries(node.data.config)) {
          if (typeof value === 'string') {
            node.data.config[key] = replaceVariables(value, input.variables, templateVars);
          }
        }
      }
    }

    nodes = nodesJson;
  }

  // Create workflow from template
  const workflow = await prisma.workflow.create({
    data: {
      userId: input.userId,
      name: input.workflowName || `${template.name} (Copy)`,
      description: template.description || '',
      nodes,
      edges,
      triggerType: 'manual'
    }
  });

  // Increment import count
  await prisma.template.update({
    where: { id: template.id },
    data: {
      imports: { increment: 1 }
    }
  });

  return workflow;
}

/**
 * Replace variables in string
 */
function replaceVariables(
  str: string,
  variables: Record<string, any>,
  templateVars: any[]
): string {
  let result = str;

  // Replace {{variableName}} patterns
  const varPattern = /\{\{(\w+)\}\}/g;
  result = result.replace(varPattern, (match, varName) => {
    const templateVar = templateVars.find(v => v.name === varName);
    if (templateVar && variables[varName] !== undefined) {
      return variables[varName];
    }
    return templateVar?.defaultValue || match;
  });

  return result;
}

/**
 * Search templates
 */
export async function searchTemplates(query: string, filters: TemplateFilters = {}) {
  return getPublicTemplates({
    ...filters,
    search: query
  });
}

/**
 * Get user's templates
 */
export async function getUserTemplates(userId: string) {
  const templates = await prisma.template.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          favorites: true
        }
      }
    }
  });

  return templates;
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  data: Partial<CreateTemplateInput>
) {
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  if (template.authorId !== userId) {
    throw new Error('Unauthorized');
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category) updateData.category = data.category;
  if (data.difficulty) updateData.difficulty = data.difficulty;
  if (data.visibility) updateData.visibility = data.visibility;
  if (data.tags) updateData.tags = data.tags;
  if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;

  return prisma.template.update({
    where: { id: templateId },
    data: updateData
  });
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string, userId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  if (template.authorId !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.template.delete({
    where: { id: templateId }
  });
}

/**
 * Favorite/unfavorite template
 */
export async function favoriteTemplate(templateId: string, userId: string) {
  const existing = await prisma.templateFavorite.findUnique({
    where: {
      userId_templateId: {
        userId,
        templateId
      }
    }
  });

  if (existing) {
    await prisma.templateFavorite.delete({
      where: { id: existing.id }
    });
    return { favorited: false };
  } else {
    await prisma.templateFavorite.create({
      data: {
        userId,
        templateId
      }
    });
    return { favorited: true };
  }
}

/**
 * Rate template
 */
export async function rateTemplate(
  templateId: string,
  userId: string,
  rating: number
) {
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const template = await prisma.template.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    throw new Error('Template not found');
  }

  // For simplicity, we'll just update the average rating
  // In production, you'd track individual ratings
  const newRatingCount = template.ratingCount + 1;
  const newRating = ((template.rating * template.ratingCount) + rating) / newRatingCount;

  return prisma.template.update({
    where: { id: templateId },
    data: {
      rating: newRating,
      ratingCount: newRatingCount
    }
  });
}

/**
 * Get template categories
 */
export function getCategories(): string[] {
  return [
    'social-media',
    'email',
    'content',
    'ecommerce',
    'support',
    'data',
    'marketing',
    'productivity'
  ];
}

/**
 * Get difficulty levels
 */
export function getDifficultyLevels(): string[] {
  return ['beginner', 'intermediate', 'advanced'];
}
