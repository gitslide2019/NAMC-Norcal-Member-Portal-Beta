import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
  rememberMe: z.boolean().optional().default(false)
})

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .transform(name => name.trim()),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .transform(name => name.trim()),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters')
    .transform(name => name.trim()),
  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .transform(title => title.trim())
    .optional(),
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions')
})

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim())
})

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
})

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .transform(name => name.trim())
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .transform(name => name.trim())
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .transform(name => name.trim())
    .optional(),
  title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .transform(title => title.trim())
    .optional(),
  bio: z.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .transform(bio => bio.trim())
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .max(255, 'Website URL must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  linkedin: z.string()
    .url('Invalid LinkedIn URL')
    .max(255, 'LinkedIn URL must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  skills: z.array(z.string().max(50, 'Skill must be less than 50 characters'))
    .max(20, 'Maximum 20 skills allowed')
    .optional()
})

// Admin validation schemas
export const contractorSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
  search: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  county: z.string().max(100).optional(),
  classification: z.string().max(50).optional(),
  licenseStatus: z.string().max(20).optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  outreachStatus: z.string().max(20).optional(),
  sortBy: z.enum(['businessName', 'city', 'licenseNumber', 'createdAt']).default('businessName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

export const contractorUpdateSchema = z.object({
  businessName: z.string()
    .min(1, 'Business name is required')
    .max(200, 'Business name must be less than 200 characters')
    .transform(name => name.trim())
    .optional(),
  dbaName: z.string()
    .max(200, 'DBA name must be less than 200 characters')
    .transform(name => name.trim())
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim())
    .optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  classification: z.string()
    .max(50, 'Classification must be less than 50 characters')
    .optional(),
  licenseStatus: z.string()
    .max(20, 'License status must be less than 20 characters')
    .optional(),
  outreachStatus: z.enum(['NOT_CONTACTED', 'CONTACTED', 'RESPONDED', 'MEMBER'])
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .transform(notes => notes.trim())
    .optional()
})

// Common validation helpers
export const idSchema = z.string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID format')
  .min(1, 'ID is required')
  .max(50, 'ID must be less than 50 characters')

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

// Type exports for use in API routes
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ContractorSearchInput = z.infer<typeof contractorSearchSchema>
export type ContractorUpdateInput = z.infer<typeof contractorUpdateSchema>

// Validation error formatter
export function formatValidationError(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}

// Common validation middleware helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${formatValidationError(error).map(e => `${e.field}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
}