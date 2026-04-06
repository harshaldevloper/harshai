import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type FilterType = 'event' | 'jsonpath' | 'regex' | 'conditional';
export type FilterOperator = 'equals' | 'contains' | 'matches' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';

export interface WebhookFilter {
  id?: string;
  workflowId: string;
  filterType: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  enabled: boolean;
  priority: number;
}

export interface FilterResult {
  matches: boolean;
  reason?: string;
  matchedFilters?: string[];
  failedFilters?: string[];
}

/**
 * Simple JSON path extractor (supports $.field.subfield notation)
 */
function extractJsonPath(obj: any, path: string): any {
  const cleanPath = path.replace(/^\$/, '').replace(/^\./, '');
  if (!cleanPath) return obj;
  
  const parts = cleanPath.split('.');
  let result = obj;
  
  for (const part of parts) {
    if (result === null || result === undefined) return undefined;
    result = result[part];
  }
  
  return result;
}

/**
 * Apply a single filter to payload
 */
function applySingleFilter(filter: WebhookFilter, payload: any): { matches: boolean; reason?: string } {
  try {
    let actualValue: any;
    
    // Extract value based on filter type
    if (filter.filterType === 'event') {
      actualValue = payload.event || payload.type || payload.action;
    } else if (filter.filterType === 'jsonpath') {
      actualValue = extractJsonPath(payload, filter.field);
    } else if (filter.filterType === 'regex') {
      actualValue = extractJsonPath(payload, filter.field);
    } else {
      actualValue = extractJsonPath(payload, filter.field);
    }
    
    // Apply operator
    switch (filter.operator) {
      case 'equals':
        return { matches: actualValue === filter.value };
      
      case 'contains':
        return { matches: String(actualValue).includes(String(filter.value)) };
      
      case 'matches':
        const regex = new RegExp(filter.value);
        return { matches: regex.test(String(actualValue)) };
      
      case 'gt':
        return { matches: Number(actualValue) > Number(filter.value) };
      
      case 'lt':
        return { matches: Number(actualValue) < Number(filter.value) };
      
      case 'gte':
        return { matches: Number(actualValue) >= Number(filter.value) };
      
      case 'lte':
        return { matches: Number(actualValue) <= Number(filter.value) };
      
      case 'exists':
        return { matches: actualValue !== undefined && actualValue !== null };
      
      default:
        return { matches: false, reason: `Unknown operator: ${filter.operator}` };
    }
  } catch (error) {
    return {
      matches: false,
      reason: error instanceof Error ? error.message : 'Filter evaluation failed',
    };
  }
}

/**
 * Apply all filters to webhook payload
 */
export async function applyFilters(
  workflowId: string,
  payload: any
): Promise<FilterResult> {
  const filters = await prisma.webhookFilter.findMany({
    where: { workflowId, enabled: true },
    orderBy: { priority: 'asc' },
  });
  
  if (filters.length === 0) {
    return { matches: true, reason: 'No filters configured' };
  }
  
  const matchedFilters: string[] = [];
  const failedFilters: string[] = [];
  
  for (const filter of filters) {
    const result = applySingleFilter(filter, payload);
    
    if (result.matches) {
      matchedFilters.push(filter.id || 'unknown');
    } else {
      failedFilters.push(filter.id || 'unknown');
      
      // If any filter fails, webhook doesn't match (AND logic)
      return {
        matches: false,
        reason: result.reason || `Filter "${filter.field}" did not match`,
        matchedFilters,
        failedFilters,
      };
    }
  }
  
  return {
    matches: true,
    matchedFilters,
    failedFilters: [],
  };
}

/**
 * Test filters against sample payload
 */
export async function testFilters(
  workflowId: string,
  payload: any
): Promise<FilterResult> {
  return applyFilters(workflowId, payload);
}

/**
 * Get filter statistics
 */
export async function getFilterStats(workflowId: string) {
  const filters = await prisma.webhookFilter.findMany({
    where: { workflowId },
    include: {
      _count: {
        select: { webhookLog: true },
      },
    },
  });
  
  return filters.map(f => ({
    id: f.id,
    field: f.field,
    operator: f.operator,
    value: f.value,
    enabled: f.enabled,
    priority: f.priority,
    matchCount: f._count.webhookLog,
  }));
}
