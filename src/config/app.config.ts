/**
 * Global application metadata & system constraints.
 */

export const APP_CONFIG = {
  name: 'FinAuditEase',
  version: '1.0.0',
  description: 'Financial Audit Management & Client Collaboration Platform',
  defaultLocale: 'en',
  supportedLocales: ['en', 'yo', 'ig', 'ha', 'pcm'] as const,
  session: {
    inactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
    warningThresholdMs: 2 * 60 * 1000, // 2 minutes before timeout
  },
  fileUpload: {
    maxFileSizeBytes: 25 * 1024 * 1024, // 25MB maximum per requirement
    maxFileSizeMb: 25,
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/csv', // .csv
      'text/plain', // .txt
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'video/mp4', // .mp4
      'video/quicktime', // .mov
      'video/webm', // .webm
    ],
    allowedExtensions: [
      '.pdf',
      '.xlsx',
      '.xls',
      '.docx',
      '.doc',
      '.csv',
      '.txt',
      '.jpeg',
      '.jpg',
      '.png',
      '.webp',
      '.svg',
      '.mp4',
      '.mov',
      '.webm',
    ],
  },
} as const

export type SupportedLocale = (typeof APP_CONFIG.supportedLocales)[number]
