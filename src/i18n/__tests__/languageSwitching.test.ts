import { describe, it, expect, beforeEach } from 'vitest'

const storageMap = new Map<string, string>()
const mockLocalStorage = {
  getItem: (k: string) => storageMap.get(k) ?? null,
  setItem: (k: string, v: string) => storageMap.set(k, String(v)),
  removeItem: (k: string) => storageMap.delete(k),
  clear: () => storageMap.clear(),
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}

import i18n, { setAppLanguage, LANGUAGE_OPTIONS } from '../index'
import type { SupportedLocale } from '@/config/app.config'

describe('Language Switching & Persistence Regression Suite (Phase B & C)', () => {
  beforeEach(() => {
    localStorage.clear()
    setAppLanguage('en')
  })

  it('provides all 5 approved Nigerian languages in LANGUAGE_OPTIONS', () => {
    const codes = LANGUAGE_OPTIONS.map((opt) => opt.code)
    expect(codes).toEqual(['en', 'yo', 'ig', 'ha', 'pcm'])
  })

  it('switches between all 5 languages dynamically without requiring page reload', () => {
    // 1. Initial English
    expect(i18n.language).toBe('en')
    expect(i18n.t('common.save')).toBe('Save')

    // 2. Switch to Yoruba (yo)
    setAppLanguage('yo')
    expect(i18n.language).toBe('yo')
    expect(i18n.t('common.save')).toBe('Fi pamọ́')
    expect(i18n.t('common.cancel')).toBe('Fagilé')

    // 3. Switch to Igbo (ig)
    setAppLanguage('ig')
    expect(i18n.language).toBe('ig')
    expect(i18n.t('common.save')).toBe('Chekwaa')
    expect(i18n.t('common.cancel')).toBe('Kagbuo')

    // 4. Switch to Hausa (ha)
    setAppLanguage('ha')
    expect(i18n.language).toBe('ha')
    expect(i18n.t('common.save')).toBe('Ajiye')
    expect(i18n.t('common.cancel')).toBe('Soke')

    // 5. Switch to Nigerian Pidgin (pcm)
    setAppLanguage('pcm')
    expect(i18n.language).toBe('pcm')
    expect(i18n.t('common.save')).toBe('Save am')
    expect(i18n.t('common.cancel')).toBe('Cancel')

    // 6. Switch back to English (en)
    setAppLanguage('en')
    expect(i18n.language).toBe('en')
    expect(i18n.t('common.save')).toBe('Save')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })

  it('persists selected language in localStorage and updates document.documentElement.lang', () => {
    const targetLocales: SupportedLocale[] = ['yo', 'ig', 'ha', 'pcm', 'en']

    for (const locale of targetLocales) {
      setAppLanguage(locale)
      expect(localStorage.getItem('finauditease_locale')).toBe(locale)
      expect(localStorage.getItem('i18nextLng')).toBe(locale)
      if (typeof document !== 'undefined') {
        expect(document.documentElement.lang).toBe(locale)
      }
    }
  })

  it('renders localized audit-specific terminology accurately in all 5 languages', () => {
    const expectedDoneLabels: Record<SupportedLocale, string> = {
      en: 'Done',
      yo: 'Ti Parí',
      ig: 'Emela Ya',
      ha: 'An Gama',
      pcm: 'Don finish',
    }

    const expectedReviewedLabels: Record<SupportedLocale, string> = {
      en: 'Reviewed',
      yo: 'Ti Yẹ̀ Wò',
      ig: 'Enyochara Ya',
      ha: 'An Yi Bita',
      pcm: 'Don review',
    }

    for (const [locale, expected] of Object.entries(expectedDoneLabels)) {
      setAppLanguage(locale as SupportedLocale)
      expect(i18n.t('checklists.statusDone')).toBe(expected)
    }

    for (const [locale, expected] of Object.entries(expectedReviewedLabels)) {
      setAppLanguage(locale as SupportedLocale)
      expect(i18n.t('checklists.statusReviewed')).toBe(expected)
    }
  })

  it('correctly interpolates variables across all 5 languages without corrupting tokens', () => {
    const testCases: SupportedLocale[] = ['en', 'yo', 'ig', 'ha', 'pcm']

    for (const locale of testCases) {
      setAppLanguage(locale)
      const formatted = i18n.t('common.showingRecords', {
        start: 1,
        end: 25,
        total: 100,
      })
      expect(formatted).toContain('1')
      expect(formatted).toContain('25')
      expect(formatted).toContain('100')
      expect(formatted).not.toContain('{{start}}')
      expect(formatted).not.toContain('{{end}}')
      expect(formatted).not.toContain('{{total}}')
    }
  })
})
