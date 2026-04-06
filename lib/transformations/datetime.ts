/**
 * Date/Time Utilities
 */

/**
 * Parse date from various formats
 */
export function parse(dateString: string, format?: string): Date {
  if (format) {
    // Custom format parsing would go here
    // For now, use native parser
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  
  return date;
}

/**
 * Format date
 */
export function format(date: Date, pattern: string): string {
  const replacements: Record<string, () => string> = {
    'YYYY': () => date.getFullYear().toString(),
    'MM': () => (date.getMonth() + 1).toString().padStart(2, '0'),
    'DD': () => date.getDate().toString().padStart(2, '0'),
    'HH': () => date.getHours().toString().padStart(2, '0'),
    'mm': () => date.getMinutes().toString().padStart(2, '0'),
    'ss': () => date.getSeconds().toString().padStart(2, '0'),
    'MMMM': () => date.toLocaleString('default', { month: 'long' }),
    'MMM': () => date.toLocaleString('default', { month: 'short' }),
    'dddd': () => date.toLocaleString('default', { weekday: 'long' }),
    'ddd': () => date.toLocaleString('default', { weekday: 'short' }),
  };
  
  let result = pattern;
  Object.entries(replacements).forEach(([key, fn]) => {
    result = result.split(key).join(fn());
  });
  
  return result;
}

/**
 * Add time to date
 */
export function add(date: Date, duration: {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): Date {
  const result = new Date(date);
  
  if (duration.years) result.setFullYear(result.getFullYear() + duration.years);
  if (duration.months) result.setMonth(result.getMonth() + duration.months);
  if (duration.days) result.setDate(result.getDate() + duration.days);
  if (duration.hours) result.setHours(result.getHours() + duration.hours);
  if (duration.minutes) result.setMinutes(result.getMinutes() + duration.minutes);
  if (duration.seconds) result.setSeconds(result.getSeconds() + duration.seconds);
  
  return result;
}

/**
 * Get difference between dates
 */
export function diff(date1: Date, date2: Date, unit: 'ms' | 's' | 'min' | 'h' | 'd' | 'w' | 'M' | 'y' = 'ms'): number {
  const diffMs = date1.getTime() - date2.getTime();
  
  switch (unit) {
    case 'ms': return diffMs;
    case 's': return Math.floor(diffMs / 1000);
    case 'min': return Math.floor(diffMs / 60000);
    case 'h': return Math.floor(diffMs / 3600000);
    case 'd': return Math.floor(diffMs / 86400000);
    case 'w': return Math.floor(diffMs / 604800000);
    case 'M': return Math.floor(diffMs / 2629800000);
    case 'y': return Math.floor(diffMs / 31557600000);
    default: return diffMs;
  }
}

/**
 * Get current date/time
 */
export function now(): Date {
  return new Date();
}

/**
 * Start of period
 */
export function startOf(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);
  
  switch (unit) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = result.getDay();
      result.setDate(result.getDate() - day);
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

/**
 * End of period
 */
export function endOf(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date {
  const result = new Date(date);
  
  switch (unit) {
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      const day = result.getDay();
      result.setDate(result.getDate() + (6 - day));
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }
  
  return result;
}

/**
 * Check if weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Convert to Unix timestamp
 */
export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * From Unix timestamp
 */
export function fromUnix(timestamp: number): Date {
  return new Date(timestamp * 1000);
}
