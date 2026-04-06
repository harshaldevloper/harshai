/**
 * Data Mapper & Transformer
 */

import { extract } from './json-parser';

/**
 * Map fields from source to destination
 */
export function map(source: any, mapping: Record<string, string | { path: string; transform?: string }>): any {
  const result: any = {};
  
  Object.entries(mapping).forEach(([destKey, sourceConfig]) => {
    let sourcePath: string;
    let transform: string | undefined;
    
    if (typeof sourceConfig === 'string') {
      sourcePath = sourceConfig;
    } else {
      sourcePath = sourceConfig.path;
      transform = sourceConfig.transform;
    }
    
    let value = extract(source, sourcePath);
    
    // Apply transformation
    if (transform && value !== undefined) {
      value = applyTransform(value, transform);
    }
    
    if (value !== undefined) {
      result[destKey] = value;
    }
  });
  
  return result;
}

/**
 * Apply transformation to value
 */
function applyTransform(value: any, transform: string): any {
  switch (transform) {
    case 'string':
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'date':
      return new Date(value);
    case 'uppercase':
      return String(value).toUpperCase();
    case 'lowercase':
      return String(value).toLowerCase();
    case 'trim':
      return String(value).trim();
    default:
      return value;
  }
}

/**
 * Flatten nested object
 */
export function flatten(obj: any, prefix: string = ''): any {
  const result: any = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
}

/**
 * Filter array by condition
 */
export function filter<T>(array: T[], field: string, operator: string, value: any): T[] {
  return array.filter(item => {
    const itemValue = extract(item, field);
    
    switch (operator) {
      case 'equals':
      case 'eq':
        return itemValue === value;
      case 'not_equals':
      case 'ne':
        return itemValue !== value;
      case 'gt':
        return itemValue > value;
      case 'gte':
        return itemValue >= value;
      case 'lt':
        return itemValue < value;
      case 'lte':
        return itemValue <= value;
      case 'contains':
        return String(itemValue).includes(String(value));
      case 'starts_with':
        return String(itemValue).startsWith(String(value));
      case 'ends_with':
        return String(itemValue).endsWith(String(value));
      default:
        return true;
    }
  });
}

/**
 * Sort array
 */
export function sort<T>(array: T[], field: string, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = extract(a, field);
    const bVal = extract(b, field);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Get unique values
 */
export function unique<T>(array: T[], field?: string): T[] {
  if (!field) {
    return Array.from(new Set(array));
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = extract(item, field);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Group array by field
 */
export function groupBy<T>(array: T[], field: string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = String(extract(item, field));
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
