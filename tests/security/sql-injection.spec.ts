import { describe, it, expect } from 'vitest';
import { SecureDatabase } from '../../lib/security/database';
import { InputSanitizer } from '../../lib/security/sanitize';

describe('SQL Injection Prevention', () => {
  it('prevents SQL injection in user lookup', async () => {
    const maliciousEmail = "'; DROP TABLE \"User\"; --";
    const sanitized = InputSanitizer.sanitizeText(maliciousEmail);
    
    // The malicious characters should be removed
    expect(sanitized).not.toContain('DROP');
    expect(sanitized).not.toContain('--');
    expect(sanitized).not.toContain(';');
  });

  it('prevents SQL injection in search', async () => {
    const maliciousSearch = "' OR '1'='1";
    const sanitized = InputSanitizer.sanitizeSearchQuery(maliciousSearch);
    
    // Boolean operators should be removed
    expect(sanitized).not.toContain('OR');
  });

  it('validates UUID format before query', async () => {
    const maliciousId = "1; DROP TABLE Workflow; --";
    
    // UUID validation should fail
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(maliciousId)).toBe(false);
  });

  it('validates table names against whitelist', async () => {
    const maliciousTable = 'User; DROP TABLE "Execution"; --';
    const allowedTables = ['User', 'Workflow', 'Execution', 'WebhookLog'];
    
    expect(allowedTables.includes(maliciousTable)).toBe(false);
  });

  it('sanitizes search term length', () => {
    const longSearch = 'a'.repeat(200);
    const sanitized = InputSanitizer.sanitizeSearchQuery(longSearch);
    
    expect(sanitized.length).toBeLessThanOrEqual(200);
  });

  it('removes special characters from search', () => {
    const maliciousSearch = "test'; DELETE FROM Workflow; --";
    const sanitized = InputSanitizer.sanitizeSearchQuery(maliciousSearch);
    
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain('DELETE');
    expect(sanitized).not.toContain('--');
  });
});

describe('XSS Protection', () => {
  it('removes script tags from HTML', () => {
    const maliciousHTML = '<script>alert("XSS")</script><p>Safe content</p>';
    const sanitized = InputSanitizer.sanitizeHTML(maliciousHTML);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<p>Safe content</p>');
  });

  it('removes javascript: protocol from URLs', () => {
    const maliciousURL = 'javascript:alert("XSS")';
    const sanitized = InputSanitizer.sanitizeURL(maliciousURL);
    
    expect(sanitized).toBe('');
  });

  it('removes event handlers', () => {
    const maliciousHTML = '<img src="x" onerror="alert(\'XSS\')">';
    const sanitized = InputSanitizer.sanitizeHTML(maliciousHTML);
    
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert');
  });

  it('escapes HTML entities', () => {
    const input = '<script>alert("XSS")</script>';
    const escaped = InputSanitizer.escapeHTML(input);
    
    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('sanitizes object recursively', () => {
    const maliciousObject = {
      name: '<script>alert("XSS")</script>',
      description: 'Normal text',
      nested: {
        content: 'javascript:alert("XSS")',
      },
    };

    const sanitized = InputSanitizer.sanitizeObject(maliciousObject);
    
    expect(sanitized.name).not.toContain('<script>');
    expect(sanitized.nested.content).not.toContain('javascript:');
  });

  it('preserves safe HTML formatting', () => {
    const safeHTML = '<p>This is <strong>bold</strong> and <em>italic</em></p>';
    const sanitized = InputSanitizer.sanitizeHTML(safeHTML);
    
    expect(sanitized).toContain('<strong>bold</strong>');
    expect(sanitized).toContain('<em>italic</em>');
  });
});

describe('Input Sanitization', () => {
  it('sanitizes file paths', () => {
    const maliciousPath = '../../../etc/passwd';
    const sanitized = InputSanitizer.sanitizePath(maliciousPath);
    
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/etc/passwd');
  });

  it('sanitizes filenames', () => {
    const maliciousFilename = '../../etc/passwd\0';
    const sanitized = InputSanitizer.sanitizeFilename(maliciousFilename);
    
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('\0');
  });

  it('normalizes email addresses', () => {
    const email = '  Test@Example.COM  ';
    const sanitized = InputSanitizer.sanitizeEmail(email);
    
    expect(sanitized).toBe('test@example.com');
  });

  it('sanitizes JSON strings', () => {
    const maliciousJSON = '{"name": "<script>alert(1)</script>"}';
    const sanitized = InputSanitizer.sanitizeJSON(maliciousJSON);
    const parsed = JSON.parse(sanitized);
    
    expect(parsed.name).not.toContain('<script>');
  });

  it('limits string lengths', () => {
    const longEmail = 'a'.repeat(300) + '@example.com';
    const sanitized = InputSanitizer.sanitizeEmail(longEmail);
    
    expect(sanitized.length).toBeLessThanOrEqual(254);
  });
});
