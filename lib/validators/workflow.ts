import { z } from 'zod';

/**
 * Workflow Validation Schemas
 * 
 * Comprehensive Zod schemas for validating workflow-related inputs.
 */

// Workflow name validation
export const workflowNameSchema = z
  .string()
  .min(1, 'Workflow name is required')
  .max(100, 'Workflow name must be less than 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    'Workflow name can only contain letters, numbers, spaces, hyphens, and underscores'
  );

// Workflow description validation
export const workflowDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional()
  .or(z.literal(''));

// Trigger type enum
export const triggerTypeEnum = z.enum(['webhook', 'schedule', 'manual']);

// Webhook trigger config
export const webhookTriggerConfigSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('POST'),
  path: z
    .string()
    .min(1, 'Webhook path is required')
    .regex(
      /^\/[a-zA-Z0-9\-_\/]+$/,
      'Webhook path must start with / and contain only letters, numbers, hyphens, underscores, and slashes'
    ),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters').optional(),
});

// Schedule trigger config
export const scheduleTriggerConfigSchema = z.object({
  cron: z
    .string()
    .regex(
      /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
      'Invalid cron expression'
    ),
  timezone: z.string().default('UTC'),
});

// Trigger config (union of webhook and schedule)
export const triggerConfigSchema = z.union([
  webhookTriggerConfigSchema,
  scheduleTriggerConfigSchema,
]);

// Trigger schema
export const triggerSchema = z.object({
  type: triggerTypeEnum,
  config: triggerConfigSchema,
});

// Action type enum
export const actionTypeEnum = z.enum(['email', 'http', 'slack', 'openai', 'webhook', 'delay']);

// Action config (flexible, validated per action type)
export const actionConfigSchema = z.record(z.any());

// Action schema
export const actionSchema = z.object({
  type: actionTypeEnum,
  name: z.string().max(50).optional(),
  config: actionConfigSchema,
  conditions: z.array(z.any()).optional(),
});

// Actions array schema
export const actionsSchema = z
  .array(actionSchema)
  .min(1, 'Workflow must have at least one action')
  .max(50, 'Workflow cannot have more than 50 actions');

// Complete workflow schema
export const workflowSchema = z.object({
  name: workflowNameSchema,
  description: workflowDescriptionSchema,
  trigger: triggerSchema,
  actions: actionsSchema,
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  tags: z.array(z.string().max(20)).max(10).optional(),
});

// Workflow update schema (partial)
export const workflowUpdateSchema = workflowSchema.partial();

// Workflow ID schema
export const workflowIdSchema = z
  .string()
  .uuid('Invalid workflow ID format');

// Export types
export type WorkflowInput = z.infer<typeof workflowSchema>;
export type WorkflowUpdateInput = z.infer<typeof workflowUpdateSchema>;
export type TriggerType = z.infer<typeof triggerTypeEnum>;
export type ActionType = z.infer<typeof actionTypeEnum>;

/**
 * Validate workflow input
 */
export function validateWorkflow(data: unknown): WorkflowInput {
  return workflowSchema.parse(data);
}

/**
 * Safely validate workflow input (returns error instead of throwing)
 */
export function validateWorkflowSafe(data: unknown): {
  success: boolean;
  data?: WorkflowInput;
  error?: z.ZodError;
} {
  const result = workflowSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, error: result.error };
}
