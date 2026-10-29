import { APP_CONFIG } from '@/config/app.config'
import type { FileValidationResult } from '../types'

/**
 * Frontend File Validation Foundation.
 *
 * NOTE: Frontend validation provides rapid, intuitive user feedback.
 * Backend services remain the final, authoritative validator.
 * No client-side encryption is performed here.
 */

export const validateUploadFile = (file: File): FileValidationResult => {
  // 1. Validate File Size (25MB Max)
  if (file.size > APP_CONFIG.fileUpload.maxFileSizeBytes) {
    return {
      isValid: false,
      errorMessage: `File size exceeds the allowed limit of ${APP_CONFIG.fileUpload.maxFileSizeMb}MB.`,
    }
  }

  // 2. Validate Empty File
  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: 'Cannot upload empty files (0 bytes).',
    }
  }

  // 3. Validate Allowed Extension
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`
  const isExtensionAllowed = APP_CONFIG.fileUpload.allowedExtensions.some(
    (ext) => ext.toLowerCase() === extension
  )

  // 4. Validate MIME Type if supplied
  const isMimeAllowed =
    !file.type ||
    APP_CONFIG.fileUpload.allowedMimeTypes.some(
      (mime) => mime.toLowerCase() === file.type.toLowerCase()
    )

  if (!isExtensionAllowed || !isMimeAllowed) {
    return {
      isValid: false,
      errorMessage:
        'Unsupported file format. Please upload PDF, Excel, Word, CSV, Images (JPEG, PNG, WEBP, SVG), or Videos (MP4, MOV, WEBM).',
    }
  }

  return { isValid: true }
}

/**
 * Format bytes into human-readable size.
 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
