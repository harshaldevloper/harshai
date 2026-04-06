import DOMPurify from 'isomorphic-dompurify';

/**
 * Input Sanitization Utilities
 * 
 * Protect against XSS, injection attacks, and other security vulnerabilities
 * by sanitizing user inputs before processing or rendering.
 */

export class InputSanitizer {
  /**
   * Sanitize HTML input
   * Removes dangerous tags and attributes while preserving safe formatting
   */
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
      ADD_ATTR: ['target'],
      FORCE_ADD_TARGET: true,
      ADD_TAGS: ['code', 'pre'],
    });
  }

  /**
   * Sanitize text input
   * Removes HTML tags and dangerous characters
   */
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onerror=, etc.)
      .replace(/&#/g, '') // Remove HTML entities
      .trim();
  }

  /**
   * Sanitize URL
   * Validates and sanitizes URLs to prevent XSS and open redirects
   */
  static sanitizeURL(input: string): string {
    try {
      const url = new URL(input);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      
      // Remove dangerous query parameters
      url.searchParams.delete('javascript');
      url.searchParams.delete('data');
      
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize file path
   * Prevents directory traversal attacks
   */
  static sanitizePath(input: string): string {
    return input
      .replace(/\.\.\//g, '') // Remove ../
      .replace(/\.\.\\/g, '') // Remove ..\
      .replace(/\.\./g, '') // Remove ..
      .replace(/^[/\\]+/, '') // Remove leading slashes
      .trim();
  }

  /**
   * Sanitize filename
   * Removes dangerous characters from filenames
   */
  static sanitizeFilename(input: string): string {
    return input
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize object recursively
   * Sanitizes all string values in an object
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Sanitize JSON string
   * Parses, sanitizes, and re-stringifies JSON
   */
  static sanitizeJSON(input: string): string {
    try {
      const parsed = JSON.parse(input);
      const sanitized = this.sanitizeObject(parsed);
      return JSON.stringify(sanitized);
    } catch {
      return '{}';
    }
  }

  /**
   * Sanitize email
   * Normalizes and validates email format
   */
  static sanitizeEmail(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .substring(0, 254); // RFC 5321 max length
  }

  /**
   * Sanitize search query
   * Prevents injection in search functionality
   */
  static sanitizeSearchQuery(input: string): string {
    return input
      .replace(/[<>\"'();{}[\]\\]/g, '') // Remove special characters
      .replace(/\b(OR|AND|NOT)\b/gi, '') // Remove boolean operators
      .trim()
      .substring(0, 200); // Limit length
  }

  /**
   * Escape HTML entities
   * Converts special characters to HTML entities
   */
  static escapeHTML(input: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };
    
    return input.replace(/[&<>"'`=/]/g, char => escapeMap[char]);
  }

  /**
   * Unescape HTML entities
   * Converts HTML entities back to characters
   */
  static unescapeHTML(input: string): string {
    const unescapeMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '=',
    };
    
    return input.replace(/&[a-z0-9#]+;/gi, entity => unescapeMap[entity] || entity);
  }

  /**
   * Validate and sanitize CSRF token
   */
  static sanitizeCSRFToken(input: string): string {
    // CSRF tokens should be alphanumeric, 32-64 characters
    const match = input.match(/^[a-zA-Z0-9]{32,64}$/);
    return match ? input : '';
  }

  /**
   * Sanitize webhook payload
   */
  static sanitizeWebhookPayload(payload: any): any {
    return this.sanitizeObject(payload);
  }

  /**
   * Sanitize markdown
   * Removes dangerous markdown while preserving formatting
   */
  static sanitizeMarkdown(input: string): string {
    // Remove HTML tags from markdown
    const withoutHTML = input.replace(/<[^>]*>/g, '');
    
    // Remove javascript: links
    const withoutJS = withoutHTML.replace(/\[([^\]]+)\]\(javascript:[^)]*\)/gi, '$1');
    
    // Remove data: links
    const withoutData = withoutJS.replace(/\[([^\]]+)\]\(data:[^)]*\)/gi, '$1');
    
    return withoutData;
  }
}

// Export convenience functions
export const sanitize = {
  html: InputSanitizer.sanitizeHTML,
  text: InputSanitizer.sanitizeText,
  url: InputSanitizer.sanitizeURL,
  path: InputSanitizer.sanitizePath,
  filename: InputSanitizer.sanitizeFilename,
  object: InputSanitizer.sanitizeObject,
  json: InputSanitizer.sanitizeJSON,
  email: InputSanitizer.sanitizeEmail,
  search: InputSanitizer.sanitizeSearchQuery,
  escape: InputSanitizer.escapeHTML,
  unescape: InputSanitizer.unescapeHTML,
  csrf: InputSanitizer.sanitizeCSRFToken,
  webhook: InputSanitizer.sanitizeWebhookPayload,
  markdown: InputSanitizer.sanitizeMarkdown,
};

export default InputSanitizer;
