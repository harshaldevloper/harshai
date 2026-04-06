// Database Security Utilities
import { prisma } from '../db/client'

/**
 * Database Security Utilities
 * 
 * - SQL injection prevention via parameterized queries (Prisma handles this)
 * - Input validation
 * - Query logging for audit
 */

export class DatabaseSecurity {
  // Log sensitive queries for audit
  static async logQuery(
    userId: string,
    action: string,
    model: string,
    details?: Record<string, unknown>
  ) {
    console.log(`[DB Audit] User: ${userId}, Action: ${action}, Model: ${model}`, details)
  }

  // Validate user has access to resource
  static async validateAccess<T>(
    userId: string,
    resource: T & { userId?: string | null },
    action: string
  ): Promise<boolean> {
    // Resource-level access control
    if ('userId' in resource && resource.userId !== userId) {
      await this.logQuery(userId, action, 'ACCESS_DENIED', { resourceId: resource })
      return false
    }
    return true
  }

  // Sanitize filter inputs to prevent injection
  static sanitizeFilter(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      // Only allow safe filter operators
      if (typeof key === 'string' && /^[a-zA-Z0-9_]+$/.test(key)) {
        sanitized[key] = value
      }
    }
    return sanitized
  }
}
