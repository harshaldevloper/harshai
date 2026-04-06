import { z } from 'zod';

/**
 * User Input Validation Schemas
 * 
 * Comprehensive Zod schemas for validating user-related inputs.
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .transform((email) => email.toLowerCase().trim());

// Password validation (strong password requirements)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => name.trim());

// Username validation
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    'Username must start with a letter and contain only letters, numbers, and underscores'
  );

// Phone number validation (international)
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits')
  .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number format')
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

// Avatar URL validation
export const avatarUrlSchema = urlSchema
  .refine(
    (url) => {
      const allowedDomains = ['gravatar.com', 'github.com', 'googleusercontent.com', 'cloudinary.com'];
      const domain = new URL(url).hostname;
      return allowedDomains.some(allowed => domain.includes(allowed));
    },
    'Avatar URL must be from a trusted provider'
  )
  .optional();

// User signup schema
export const userSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  username: usernameSchema.optional(),
  avatar: avatarUrlSchema,
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// User profile update schema
export const userProfileUpdateSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  avatar: avatarUrlSchema,
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  website: urlSchema.optional(),
  location: z.string().max(50).optional(),
});

// User settings schema
export const userSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Two-factor authentication schema
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

// API key schema
export const apiKeySchema = z.object({
  name: z.string().min(1).max(50, 'API key name must be less than 50 characters'),
  scopes: z.array(z.enum(['read', 'write', 'admin'])).default(['read']),
  expiresAt: z.date().optional(),
});

// Export types
export type UserSignupInput = z.infer<typeof userSignupSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
export type APIKeyInput = z.infer<typeof apiKeySchema>;

/**
 * Validate user signup
 */
export function validateUserSignup(data: unknown): UserSignupInput {
  return userSignupSchema.parse(data);
}

/**
 * Validate user login
 */
export function validateUserLogin(data: unknown): UserLoginInput {
  return userLoginSchema.parse(data);
}

/**
 * Safely validate user input (returns error instead of throwing)
 */
export function validateUserSafe<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; error?: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data as z.infer<T> };
  }
  
  return { success: false, error: result.error };
}
