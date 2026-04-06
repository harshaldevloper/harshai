/**
 * Condition Evaluator - Day 37
 * Evaluate conditions for branching logic
 */

export interface Condition {
  field: string;
  operator: Operator;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export type Operator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'regex_match'
  | 'in'
  | 'not_in';

export type LogicOperator = 'AND' | 'OR';

/**
 * Evaluate a single condition
 */
export function evaluateCondition(
  condition: Condition,
  data: Record<string, any>
): boolean {
  const { field, operator, value, type } = condition;

  // Extract value from data using field path (supports dot notation)
  const actualValue = getNestedValue(data, field);

  // Handle unary operators
  if (operator === 'is_empty') {
    return isEmpty(actualValue);
  }

  if (operator === 'is_not_empty') {
    return !isEmpty(actualValue);
  }

  // Type coercion if type specified
  const coercedActual = type ? coerceType(actualValue, type) : actualValue;
  const coercedExpected = type ? coerceType(value, type) : value;

  // Evaluate based on operator
  switch (operator) {
    case 'equals':
      return coercedActual === coercedExpected;

    case 'not_equals':
      return coercedActual !== coercedExpected;

    case 'contains':
      return includes(coercedActual, coercedExpected);

    case 'not_contains':
      return !includes(coercedActual, coercedExpected);

    case 'starts_with':
      return String(coercedActual || '').startsWith(String(coercedExpected || ''));

    case 'ends_with':
      return String(coercedActual || '').endsWith(String(coercedExpected || ''));

    case 'greater_than':
      return Number(coercedActual) > Number(coercedExpected);

    case 'less_than':
      return Number(coercedActual) < Number(coercedExpected);

    case 'greater_than_or_equal':
      return Number(coercedActual) >= Number(coercedExpected);

    case 'less_than_or_equal':
      return Number(coercedActual) <= Number(coercedExpected);

    case 'regex_match':
      try {
        const regex = new RegExp(coercedExpected);
        return regex.test(String(coercedActual || ''));
      } catch {
        return false;
      }

    case 'in':
      return Array.isArray(coercedExpected) && coercedExpected.includes(coercedActual);

    case 'not_in':
      return !Array.isArray(coercedExpected) || !coercedExpected.includes(coercedActual);

    default:
      return false;
  }
}

/**
 * Evaluate multiple conditions with AND/OR logic
 */
export function evaluateConditions(
  conditions: Condition[],
  data: Record<string, any>,
  logic: LogicOperator = 'AND'
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  if (logic === 'AND') {
    return conditions.every(condition => evaluateCondition(condition, data));
  } else {
    // OR logic
    return conditions.some(condition => evaluateCondition(condition, data));
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!path) return obj;

  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return undefined;
    }

    // Handle array indexing
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      result = result[arrayKey];
      if (Array.isArray(result)) {
        result = result[parseInt(index, 10)];
      } else {
        return undefined;
      }
    } else {
      result = result[key];
    }
  }

  return result;
}

/**
 * Check if value is empty
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value includes another value
 */
function includes(container: any, value: any): boolean {
  if (Array.isArray(container)) {
    return container.includes(value);
  }
  if (typeof container === 'string') {
    return container.includes(String(value));
  }
  return false;
}

/**
 * Coerce value to specified type
 */
function coerceType(value: any, type: string): any {
  if (value === null || value === undefined) return value;

  switch (type) {
    case 'string':
      return String(value);

    case 'number':
      return Number(value);

    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return ['true', 'yes', '1'].includes(value.toLowerCase());
      }
      return Boolean(value);

    case 'array':
      return Array.isArray(value) ? value : [value];

    case 'object':
      return typeof value === 'object' ? value : { value };

    default:
      return value;
  }
}

/**
 * Get all available operators
 */
export function getOperators(): Array<{ value: Operator; label: string }> {
  return [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_than_or_equal', label: 'Greater Than or Equal' },
    { value: 'less_than_or_equal', label: 'Less Than or Equal' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'regex_match', label: 'Matches Regex' },
    { value: 'in', label: 'In List' },
    { value: 'not_in', label: 'Not In List' }
  ];
}

/**
 * Get operators compatible with a type
 */
export function getOperatorsForType(type: string): Array<{ value: Operator; label: string }> {
  const allOperators = getOperators();

  if (type === 'number') {
    return allOperators.filter(op =>
      ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal'].includes(op.value)
    );
  }

  if (type === 'string') {
    return allOperators.filter(op =>
      !['greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal'].includes(op.value)
    );
  }

  return allOperators;
}
