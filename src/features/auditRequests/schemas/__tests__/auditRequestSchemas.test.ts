import { describe, it, expect } from 'vitest'
import { createAuditRequestSchema } from '../auditRequestSchemas'

describe('Audit Request Creation Schema', () => {
  it('validates a compliant audit request payload', () => {
    const validData = {
      engagementId: 'eng_123',
      title: 'Q3 Bank Reconciliation Statements and Certificates',
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2026-11-15',
      description: 'Please upload the stamped bank reconciliation schedules for all operational accounts.',
    }

    const result = createAuditRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects payload with missing engagement ID', () => {
    const invalidData = {
      engagementId: '',
      title: 'Q3 Bank Reconciliation',
      category: 'Cash & Equivalents',
      priority: 'MEDIUM' as const,
      dueDate: '2026-11-15',
      description: 'Detailed instructions here.',
    }

    const result = createAuditRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects short title under 3 characters', () => {
    const invalidData = {
      engagementId: 'eng_123',
      title: 'Q3',
      category: 'Cash & Equivalents',
      priority: 'MEDIUM' as const,
      dueDate: '2026-11-15',
      description: 'Detailed instructions here.',
    }

    const result = createAuditRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects invalid priority value', () => {
    const invalidData = {
      engagementId: 'eng_123',
      title: 'Q3 Bank Reconciliation',
      category: 'Cash & Equivalents',
      priority: 'URGENT_NOW',
      dueDate: '2026-11-15',
      description: 'Detailed instructions here.',
    }

    const result = createAuditRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects deadline date in the past', () => {
    const pastData = {
      engagementId: 'eng_123',
      title: 'Q3 Bank Reconciliation',
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2020-01-01',
      description: 'Detailed instructions here.',
    }

    const result = createAuditRequestSchema.safeParse(pastData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Deadline cannot be in the past')
    }
  })

  it('accepts optional assigneeId', () => {
    const validWithAssignee = {
      engagementId: 'eng_123',
      title: 'Q3 Bank Reconciliation Statements and Certificates',
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2026-11-15',
      description: 'Please upload the stamped bank reconciliation schedules for all operational accounts.',
      assigneeId: 'usr_accounting_99',
    }

    const result = createAuditRequestSchema.safeParse(validWithAssignee)
    expect(result.success).toBe(true)
  })

  it('rejects whitespace-only title', () => {
    const whitespaceTitle = {
      engagementId: 'eng_123',
      title: '     ',
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2026-11-15',
      description: 'Detailed instructions here.',
    }

    const result = createAuditRequestSchema.safeParse(whitespaceTitle)
    expect(result.success).toBe(false)
  })

  it('rejects whitespace-only description', () => {
    const whitespaceDesc = {
      engagementId: 'eng_123',
      title: 'Valid Title Here',
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2026-11-15',
      description: '       ',
    }

    const result = createAuditRequestSchema.safeParse(whitespaceDesc)
    expect(result.success).toBe(false)
  })

  it('rejects title over 200 characters', () => {
    const longTitle = {
      engagementId: 'eng_123',
      title: 'A'.repeat(201),
      category: 'Cash & Equivalents',
      priority: 'HIGH' as const,
      dueDate: '2026-11-15',
      description: 'Valid description here.',
    }

    const result = createAuditRequestSchema.safeParse(longTitle)
    expect(result.success).toBe(false)
  })
})
