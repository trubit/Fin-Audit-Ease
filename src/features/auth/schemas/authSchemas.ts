import { z } from 'zod'

/**
 * Enterprise Password Policy (PRD Specification):
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one symbol
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol')

export const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please provide a valid corporate email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Option 1: Auditor Signup Schema
 */
export const auditorSignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z.string().min(1, 'Email address is required').email('Please provide a valid corporate email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firmName: z
      .string()
      .min(2, 'Firm name must be at least 2 characters')
      .max(120, 'Firm name cannot exceed 120 characters'),
    professionalBody: z.enum(['ICAN', 'ACCA', 'ICAEW'], {
      errorMap: () => ({ message: 'Please select a valid professional accounting body (ICAN, ACCA, or ICAEW)' }),
    }),
    membershipNumber: z
      .string()
      .min(2, 'Audit firm approved registration number is required')
      .max(50, 'Audit firm registration number cannot exceed 50 characters'),
    preferredLanguage: z.enum(['en', 'yo', 'ig', 'ha', 'pcm'], {
      errorMap: () => ({ message: 'Please select a preferred language' }),
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service and privacy policy to register',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type AuditorSignUpFormData = z.infer<typeof auditorSignupSchema>

/**
 * Option 2: Accounting Team — Self Registration Schema
 */
export const accountingTeamSignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z.string().min(1, 'Email address is required').email('Please provide a valid corporate email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(150, 'Company name cannot exceed 150 characters'),
    jobTitle: z
      .string()
      .min(2, 'Job title must be at least 2 characters')
      .max(100, 'Job title cannot exceed 100 characters'),
    accountingYearEndDate: z
      .string()
      .min(4, 'Accounting year-end date is required')
      .max(30, 'Invalid year-end date format'),
    commencementDate: z
      .string()
      .max(30, 'Invalid commencement date format')
      .optional()
      .or(z.literal('')),
    preferredLanguage: z.enum(['en', 'yo', 'ig', 'ha', 'pcm'], {
      errorMap: () => ({ message: 'Please select a preferred language' }),
    }),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service and privacy policy to register',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type AccountingTeamSignUpFormData = z.infer<typeof accountingTeamSignupSchema>

/**
 * Base / Legacy Signup Schema (Kept for compatibility with generic tests)
 */
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z.string().min(1, 'Email address is required').email('Please provide a valid corporate email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    membershipNumber: z
      .string()
      .max(50, 'Membership number cannot exceed 50 characters')
      .optional()
      .or(z.literal('')),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service and privacy policy to register',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please provide a valid corporate email address'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(1, 'Verification code is required')
    .regex(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
})

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>

/**
 * Option 3: Accept Invitation Schema
 */
export const acceptInvitationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z.string().email('Please provide a valid email address').optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    preferredLanguage: z.enum(['en', 'yo', 'ig', 'ha', 'pcm']).optional(),
    termsAccepted: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>
