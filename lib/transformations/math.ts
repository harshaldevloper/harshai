/**
 * Math & Calculation Utilities
 */

/**
 * Basic calculation
 */
export function calculate(
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power',
  a: number,
  b: number
): number {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return b !== 0 ? a / b : NaN;
    case 'modulo': return a % b;
    case 'power': return Math.pow(a, b);
    default: return NaN;
  }
}

/**
 * Aggregate array
 */
export function aggregate(
  array: number[],
  operation: 'sum' | 'average' | 'min' | 'max' | 'median' | 'count'
): number {
  if (array.length === 0) return 0;
  
  switch (operation) {
    case 'sum':
      return array.reduce((a, b) => a + b, 0);
    case 'average':
      return array.reduce((a, b) => a + b, 0) / array.length;
    case 'min':
      return Math.min(...array);
    case 'max':
      return Math.max(...array);
    case 'median':
      const sorted = [...array].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    case 'count':
      return array.length;
    default:
      return 0;
  }
}

/**
 * Round number
 */
export function round(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage
 */
export function percentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Calculate percentage of value
 */
export function percentageOf(value: number, percent: number): number {
  return (value * percent) / 100;
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Random number in range
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
