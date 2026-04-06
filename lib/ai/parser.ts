/**
 * AI Response Parser
 * Extract and validate AI responses
 */

import { z } from 'zod';

/**
 * Extract JSON from AI response text
 */
export function extractJsonFromResponse(response: string): string {
  // Try to find JSON object
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Try to find JSON array
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  throw new Error('No JSON found in response');
}

/**
 * Parse and validate JSON response
 */
export async function parseJsonResponse<T extends z.ZodType>(
  response: string,
  schema: T
): Promise<z.infer<T>> {
  const jsonString = extractJsonFromResponse(response);
  const parsed = JSON.parse(jsonString);
  return schema.parse(parsed);
}

/**
 * Extract code blocks from response
 */
export function extractCodeBlocks(response: string): Array<{
  language: string;
  code: string;
}> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  return blocks;
}

/**
 * Clean AI response (remove markdown, extra whitespace)
 */
export function cleanResponse(response: string): string {
  return response
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\n{3,}/g, '\n\n') // Normalize newlines
    .trim();
}

/**
 * Split multi-part response
 */
export function splitResponse(response: string, delimiter: string = '\n---\n'): string[] {
  return response.split(delimiter).map(s => s.trim()).filter(Boolean);
}

/**
 * Extract links from response
 */
export function extractLinks(response: string): string[] {
  const linkRegex = /https?:\/\/[^\s\)]+/g;
  return response.match(linkRegex) || [];
}

/**
 * Extract citations from response
 */
export function extractCitations(response: string): Array<{
  text: string;
  citation: string;
}> {
  const citationRegex = /\[(\d+)\]/g;
  const citations: Array<{ text: string; citation: string }> = [];
  let match;

  const lines = response.split('\n');
  for (const line of lines) {
    if ((match = citationRegex.exec(line)) !== null) {
      citations.push({
        text: line.replace(citationRegex, '').trim(),
        citation: match[0],
      });
    }
  }

  return citations;
}

/**
 * Detect potential hallucinations
 */
export function detectHallucinations(
  response: string,
  context: string
): {
  score: number;
  flags: string[];
} {
  const flags: string[] = [];
  let score = 0;

  // Check for uncertainty markers
  const uncertaintyWords = ['might', 'could', 'possibly', 'perhaps', 'i think', 'i believe'];
  const uncertaintyCount = uncertaintyWords.filter(w =>
    response.toLowerCase().includes(w)
  ).length;

  if (uncertaintyCount > 3) {
    flags.push('High uncertainty language');
    score += uncertaintyCount * 10;
  }

  // Check for factual claims without sources
  const factualPatterns = ['is known', 'research shows', 'studies indicate', 'according to'];
  const hasFactualClaim = factualPatterns.some(p => response.toLowerCase().includes(p));
  const hasCitation = /\[\d+\]/.test(response) || /https?:\/\//.test(response);

  if (hasFactualClaim && !hasCitation) {
    flags.push('Factual claim without citation');
    score += 20;
  }

  // Check for very specific numbers without context
  const specificNumbers = response.match(/\b\d{4,}\b/g);
  if (specificNumbers && specificNumbers.length > 2) {
    flags.push('Multiple specific numbers without sources');
    score += 15;
  }

  return {
    score: Math.min(score, 100),
    flags,
  };
}

/**
 * Validate response quality
 */
export function validateResponse(
  response: string,
  options: {
    minLength?: number;
    maxLength?: number;
    requireJson?: boolean;
    allowedTopics?: string[];
  } = {}
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (options.minLength && response.length < options.minLength) {
    errors.push(`Response too short (min: ${options.minLength})`);
  }

  if (options.maxLength && response.length > options.maxLength) {
    errors.push(`Response too long (max: ${options.maxLength})`);
  }

  if (options.requireJson) {
    try {
      extractJsonFromResponse(response);
    } catch {
      errors.push('Response does not contain valid JSON');
    }
  }

  if (options.allowedTopics?.length) {
    const responseLower = response.toLowerCase();
    const hasAllowedTopic = options.allowedTopics.some(topic =>
      responseLower.includes(topic.toLowerCase())
    );
    if (!hasAllowedTopic) {
      errors.push('Response does not cover allowed topics');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
