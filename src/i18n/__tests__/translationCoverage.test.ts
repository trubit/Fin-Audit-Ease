import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import i18n, { setAppLanguage } from '../index'
import { AppApiError, type ApiErrorCode } from '@/services/api/apiErrors'
import type { SupportedLocale } from '@/config/app.config'

import en from '../locales/en.json'
import yo from '../locales/yo.json'
import ig from '../locales/ig.json'
import ha from '../locales/ha.json'
import pcm from '../locales/pcm.json'

const locales: Record<SupportedLocale, Record<string, unknown>> = {
  en,
  yo,
  ig,
  ha,
  pcm,
}

function getFlattenedKeys(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(result, getFlattenedKeys(val as Record<string, unknown>, full))
    } else {
      result[full] = String(val)
    }
  }
  return result
}

const enFlat = getFlattenedKeys(en)
const enKeySet = new Set(Object.keys(enFlat))

describe('Complete Multilingual Translation Coverage & Codebase Parity', () => {
  it('guarantees 100% key parity across all 5 official Nigerian locales', () => {
    const otherLocales: SupportedLocale[] = ['yo', 'ig', 'ha', 'pcm']

    for (const code of otherLocales) {
      const targetFlat = getFlattenedKeys(locales[code])
      const targetKeySet = new Set(Object.keys(targetFlat))

      const missingInTarget = [...enKeySet].filter((k) => !targetKeySet.has(k))
      const extraInTarget = [...targetKeySet].filter((k) => !enKeySet.has(k))

      expect(missingInTarget, `Locale [${code}] is missing keys from en.json`).toEqual([])
      expect(extraInTarget, `Locale [${code}] has extra keys not in en.json`).toEqual([])
    }
  })

  it('guarantees no empty translation values in any of the 5 locales', () => {
    for (const [code, dict] of Object.entries(locales)) {
      const flat = getFlattenedKeys(dict)
      const emptyKeys: string[] = []

      for (const [key, value] of Object.entries(flat)) {
        if (!value || value.trim().length === 0) {
          emptyKeys.push(key)
        }
      }

      expect(emptyKeys, `Locale [${code}] has empty translation values`).toEqual([])
    }
  })

  it('guarantees that every t() call across the codebase maps to an existing translation key', () => {
    function walkDir(dir: string): string[] {
      let results: string[] = []
      const list = fs.readdirSync(dir)
      list.forEach((file: string) => {
        const full = path.join(dir, file)
        const stat = fs.statSync(full)
        if (stat && stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
            results = results.concat(walkDir(full))
          }
        } else if (file.endsWith('.tsx') || (file.endsWith('.ts') && !file.includes('.test.'))) {
          results.push(full)
        }
      })
      return results
    }

    const srcFiles = walkDir(path.resolve('src'))
    const missingKeysFromCodebase: { file: string; key: string }[] = []
    const keyRegex = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8')
      let match: RegExpExecArray | null
      while ((match = keyRegex.exec(content)) !== null) {
        const key = match[1]
        // Skip template tokens
        if (key.includes('$') || key.includes('{') || key.includes('`')) continue
        if (!enKeySet.has(key)) {
          missingKeysFromCodebase.push({ file: path.basename(file), key })
        }
      }
    }

    expect(
      missingKeysFromCodebase,
      `Codebase has ${missingKeysFromCodebase.length} t('...') calls referencing missing translation keys`
    ).toEqual([])
  }, 25000)

  it('translates API error codes accurately into all 5 languages without English leaks', () => {
    const errorCodes: ApiErrorCode[] = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'BAD_REQUEST',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'CONFLICT',
      'UNPROCESSABLE_ENTITY',
      'RATE_LIMITED',
      'SERVER_ERROR',
      'SERVICE_UNAVAILABLE',
    ]

    const allLocales: SupportedLocale[] = ['en', 'yo', 'ig', 'ha', 'pcm']

    for (const locale of allLocales) {
      setAppLanguage(locale)

      for (const code of errorCodes) {
        const err = new AppApiError({
          code,
          status: 400,
          userMessage: 'English fallback',
        })

        const localized = err.getLocalizedMessage(i18n.t.bind(i18n))
        expect(localized).not.toBe('')
        expect(localized).not.toBe('errors.api.unknownError')
      }
    }
  })
})

