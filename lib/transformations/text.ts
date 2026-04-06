/**
 * Text Transformation Utilities
 */

/**
 * Format text with various options
 */
export function format(text: string, type: string): string {
  switch (type) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'titlecase':
      return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentencecase':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'trim':
      return text.trim();
    case 'clean':
      return text.replace(/\s+/g, ' ').trim();
    default:
      return text;
  }
}

/**
 * Extract patterns from text
 */
export function extract(text: string, pattern: string): string[] {
  const regex = new RegExp(pattern, 'g');
  const matches = text.match(regex);
  return matches || [];
}

/**
 * Extract between markers
 */
export function extractBetween(text: string, start: string, end: string): string {
  const startIndex = text.indexOf(start);
  if (startIndex === -1) return '';
  
  const endIndex = text.indexOf(end, startIndex + start.length);
  if (endIndex === -1) return '';
  
  return text.slice(startIndex + start.length, endIndex);
}

/**
 * Replace text
 */
export function replace(
  text: string,
  find: string,
  replaceWith: string,
  options: { all?: boolean; regex?: boolean } = {}
): string {
  if (options.regex) {
    const flags = options.all ? 'g' : '';
    return text.replace(new RegExp(find, flags), replaceWith);
  }
  
  if (options.all) {
    return text.split(find).join(replaceWith);
  }
  
  return text.replace(find, replaceWith);
}

/**
 * Template interpolation
 */
export function template(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const keys = key.trim().split('.');
    let value: any = data;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Extract emails from text
 */
export function extractEmails(text: string): string[] {
  return extract(text, '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  return extract(text, 'https?:\\/\\/[^\\s<>"{}|\\\\^`\\[\\]]+');
}

/**
 * Clean text
 */
export function clean(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
}
