import { describe, it, expect } from 'vitest'
import { validateUploadFile, formatBytes } from '../validation'

describe('File Validation & Byte Formatting', () => {
  it('formats bytes into readable strings', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(26214400)).toBe('25 MB')
  })

  it('rejects files larger than 25MB', () => {
    // 26MB dummy file
    const oversizedFile = new File(['x'.repeat(100)], 'large_ledger.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(oversizedFile, 'size', { value: 26 * 1024 * 1024 })

    const result = validateUploadFile(oversizedFile)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain('exceeds the allowed limit of 25MB')
  })

  it('rejects empty files (0 bytes)', () => {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' })
    const result = validateUploadFile(emptyFile)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain('Cannot upload empty files')
  })

  it('rejects unsupported file extensions', () => {
    const dangerousFile = new File(['echo hello'], 'script.exe', {
      type: 'application/x-msdownload',
    })
    const result = validateUploadFile(dangerousFile)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain('Unsupported file format')
  })

  it('accepts compliant PDF files within 25MB', () => {
    const validPdf = new File(['%PDF-1.5 dummy content'], 'q3_reconciliation.pdf', {
      type: 'application/pdf',
    })
    const result = validateUploadFile(validPdf)
    expect(result.isValid).toBe(true)
  })

  it('accepts compliant Excel (.xlsx) files within 25MB', () => {
    const validExcel = new File(['dummy excel content'], 'trial_balance.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const result = validateUploadFile(validExcel)
    expect(result.isValid).toBe(true)
  })

  it('accepts compliant audit video evidence (.mp4, .mov, .webm)', () => {
    const validVideo = new File(['dummy video bytes'], 'inventory_stock_count.mp4', {
      type: 'video/mp4',
    })
    const result = validateUploadFile(validVideo)
    expect(result.isValid).toBe(true)
  })

  it('accepts compliant modern images and CSV documents', () => {
    const validWebp = new File(['dummy webp bytes'], 'physical_asset.webp', {
      type: 'image/webp',
    })
    const validCsv = new File(['col1,col2\n1,2'], 'reconciliation_extract.csv', {
      type: 'text/csv',
    })
    expect(validateUploadFile(validWebp).isValid).toBe(true)
    expect(validateUploadFile(validCsv).isValid).toBe(true)
  })
})
