import { describe, it, expect } from 'vitest'
import {
  passwordSchema,
  loginSchema,
  signupSchema,
  auditorSignupSchema,
  accountingTeamSignupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorSchema,
  acceptInvitationSchema,
} from '../authSchemas'

describe('Password Policy Validation', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Sh1!Aa')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 8 characters')
    }
  })

  it('rejects passwords missing uppercase letters', () => {
    const result = passwordSchema.safeParse('lowercase12345!@#')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('uppercase letter')
    }
  })

  it('rejects passwords missing lowercase letters', () => {
    const result = passwordSchema.safeParse('UPPERCASE12345!@#')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('lowercase letter')
    }
  })

  it('rejects passwords missing numeric digits', () => {
    const result = passwordSchema.safeParse('NoDigitsHere!@#$Abc')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('number')
    }
  })

  it('rejects passwords missing special characters', () => {
    const result = passwordSchema.safeParse('NoSpecialChars12345')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('symbol')
    }
  })

  it('accepts compliant strong enterprise passwords', () => {
    const result = passwordSchema.safeParse('FinAuditSecure2026!#')
    expect(result.success).toBe(true)
  })
})

describe('Login Schema Validation', () => {
  it('validates correct email and password', () => {
    const result = loginSchema.safeParse({
      email: 'auditor@firm.ng',
      password: 'AnyPassword123!',
      rememberMe: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email formats', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'auditor@firm.ng',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('Signup Schema Validation', () => {
  it('validates compliant registration payload', () => {
    const result = signupSchema.safeParse({
      fullName: 'Adebayo Ogunlesi',
      email: 'adebayo@auditfirm.ng',
      password: 'StrongPassword123!#',
      confirmPassword: 'StrongPassword123!#',
      membershipNumber: 'ICAN/2026/001',
      termsAccepted: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects registration when passwords do not match', () => {
    const result = signupSchema.safeParse({
      fullName: 'Adebayo Ogunlesi',
      email: 'adebayo@auditfirm.ng',
      password: 'StrongPassword123!#',
      confirmPassword: 'DifferentPassword123!#',
      termsAccepted: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('do not match')
    }
  })

  it('rejects registration if terms are not accepted', () => {
    const result = signupSchema.safeParse({
      fullName: 'Adebayo Ogunlesi',
      email: 'adebayo@auditfirm.ng',
      password: 'StrongPassword123!#',
      confirmPassword: 'StrongPassword123!#',
      termsAccepted: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('Forgot Password Schema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'corporate.cfo@enterprise.ng',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('Reset Password Schema', () => {
  it('accepts matching strong passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'BrandNewSecurePassword2026!#',
      confirmPassword: 'BrandNewSecurePassword2026!#',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'BrandNewSecurePassword2026!#',
      confirmPassword: 'MismatchPassword2026!#',
    })
    expect(result.success).toBe(false)
  })
})

describe('Two-Factor Authentication Schema', () => {
  it('accepts exact 6-digit numeric codes', () => {
    expect(twoFactorSchema.safeParse({ code: '123456' }).success).toBe(true)
    expect(twoFactorSchema.safeParse({ code: '000000' }).success).toBe(true)
  })

  it('rejects non-numeric codes', () => {
    expect(twoFactorSchema.safeParse({ code: '12345a' }).success).toBe(false)
    expect(twoFactorSchema.safeParse({ code: 'abcdef' }).success).toBe(false)
  })

  it('rejects codes not exactly 6 digits', () => {
    expect(twoFactorSchema.safeParse({ code: '12345' }).success).toBe(false)
    expect(twoFactorSchema.safeParse({ code: '1234567' }).success).toBe(false)
  })
})

describe('Accept Invitation Schema', () => {
  it('accepts valid invitation form data', () => {
    const result = acceptInvitationSchema.safeParse({
      fullName: 'Ngozi Okonjo',
      password: 'SecureInvitationPassword2026!#',
      confirmPassword: 'SecureInvitationPassword2026!#',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short full name', () => {
    const result = acceptInvitationSchema.safeParse({
      fullName: 'N',
      password: 'SecureInvitationPassword2026!#',
      confirmPassword: 'SecureInvitationPassword2026!#',
    })
    expect(result.success).toBe(false)
  })
})

describe('Auditor Signup Schema Validation (Option 1)', () => {
  it('accepts valid auditor registration payload', () => {
    const result = auditorSignupSchema.safeParse({
      fullName: 'Dr. Tunde Fashola',
      email: 'tunde@fashola-auditors.ng',
      password: 'SecureAuditor2026!#',
      confirmPassword: 'SecureAuditor2026!#',
      firmName: 'Fashola & Partners Audit',
      professionalBody: 'ICAN',
      membershipNumber: 'ICAN/MBR/48291',
      preferredLanguage: 'en',
      termsAccepted: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects unsupported professional body', () => {
    const result = auditorSignupSchema.safeParse({
      fullName: 'Dr. Tunde Fashola',
      email: 'tunde@fashola-auditors.ng',
      password: 'SecureAuditor2026!#',
      confirmPassword: 'SecureAuditor2026!#',
      firmName: 'Fashola & Partners Audit',
      professionalBody: 'UNAUTHORIZED_BODY',
      membershipNumber: 'ICAN/MBR/48291',
      termsAccepted: true,
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing firm name or membership number', () => {
    const result = auditorSignupSchema.safeParse({
      fullName: 'Dr. Tunde Fashola',
      email: 'tunde@fashola-auditors.ng',
      password: 'SecureAuditor2026!#',
      confirmPassword: 'SecureAuditor2026!#',
      firmName: '',
      professionalBody: 'ACCA',
      membershipNumber: '',
      termsAccepted: true,
    })
    expect(result.success).toBe(false)
  })
})

describe('Accounting Team Signup Schema Validation (Option 2)', () => {
  it('accepts valid accounting team self-registration payload', () => {
    const result = accountingTeamSignupSchema.safeParse({
      fullName: 'Chioma Adeyemi',
      email: 'chioma@lagosenterprises.ng',
      password: 'SecureFinance2026!#',
      confirmPassword: 'SecureFinance2026!#',
      companyName: 'Lagos Enterprises PLC',
      jobTitle: 'Chief Financial Officer',
      accountingYearEndDate: '2026-12-31',
      preferredLanguage: 'en',
      termsAccepted: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing company name or fiscal year end', () => {
    const result = accountingTeamSignupSchema.safeParse({
      fullName: 'Chioma Adeyemi',
      email: 'chioma@lagosenterprises.ng',
      password: 'SecureFinance2026!#',
      confirmPassword: 'SecureFinance2026!#',
      companyName: '',
      jobTitle: 'Accountant',
      accountingYearEndDate: '',
      termsAccepted: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional commencement date in accounting team payload', () => {
    const result = accountingTeamSignupSchema.safeParse({
      fullName: 'Chioma Adeyemi',
      email: 'chioma@lagosenterprises.ng',
      password: 'SecureFinance2026!#',
      confirmPassword: 'SecureFinance2026!#',
      companyName: 'Lagos Enterprises PLC',
      jobTitle: 'Chief Financial Officer',
      accountingYearEndDate: '2026-12-31',
      commencementDate: '2026-01-01',
      preferredLanguage: 'en',
      termsAccepted: true,
    })
    expect(result.success).toBe(true)
  })
})

