/**
 * JSON Parser & Transformer
 */

/**
 * Extract value from object by dot notation path
 */
export function extract(obj: any, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Handle array access
    const arrayMatch = key.match(/^(.*)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      current = current[arrayKey || '']?.[parseInt(index, 10)];
    } else {
      current = current[key];
    }
  }
  
  return current;
}

/**
 * Set value in object by path
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Parse JSON string safely
 */
export function parse(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON');
  }
}

/**
 * Merge objects
 */
export function merge(...objects: any[]): any {
  return objects.reduce((acc, obj) => {
    if (typeof obj !== 'object' || obj === null) return acc;
    
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        acc[key] = merge(acc[key] || {}, obj[key]);
      } else {
        acc[key] = obj[key];
      }
    });
    
    return acc;
  }, {});
}

/**
 * Filter array by condition
 */
export function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

/**
 * Map array elements
 */
export function map<T, U>(array: T[], fn: (item: T, index: number) => U): U[] {
  return array.map(fn);
}

/**
 * Validate against simple schema
 */
export function validate(obj: any, schema: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  Object.entries(schema).forEach(([key, type]) => {
    const value = obj[key];
    
    if (value === undefined) {
      errors.push(`Missing required field: ${key}`);
      return;
    }
    
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== type) {
      errors.push(`Field "${key}" should be ${type}, got ${actualType}`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
