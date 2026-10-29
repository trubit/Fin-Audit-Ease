import { describe, it, expect } from 'vitest'
import i18n from '../index'
import en from '../locales/en.json'
import yo from '../locales/yo.json'
import ig from '../locales/ig.json'
import ha from '../locales/ha.json'
import pcm from '../locales/pcm.json'

const locales = {
  yo,
  ig,
  ha,
  pcm,
}

// Helper to flatten nested JSON keys
function flattenKeys(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(result, flattenKeys(val as Record<string, unknown>, newKey))
    } else {
      result[newKey] = String(val)
    }
  }
  return result
}

// Extract interpolation variables like {{name}}
function extractVariables(str: string): string[] {
  const matches = str.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map((m) => m.replace(/[{}]/g, '').trim()).sort()
}

describe('Multilingual i18n Quality and Completeness (Phase 12)', () => {
  const enFlat = flattenKeys(en)
  const enKeys = Object.keys(enFlat).sort()

  it('has a substantial dictionary in English source', () => {
    expect(enKeys.length).toBeGreaterThan(100)
  })

  it('does not use unapproved "Finance Team" or "Finance User" in English copy', () => {
    const forbiddenPhrases = ['Finance Team', 'Finance User']
    const violations: string[] = []
    for (const [key, text] of Object.entries(enFlat)) {
      for (const phrase of forbiddenPhrases) {
        if (text.includes(phrase)) {
          violations.push(`${key}: "${text}" contains "${phrase}"`)
        }
      }
    }
    expect(violations).toEqual([])
  })

  for (const [lang, dict] of Object.entries(locales)) {
    describe(`Locale: ${lang}`, () => {
      const targetFlat = flattenKeys(dict)
      const targetKeys = Object.keys(targetFlat)

      it(`contains all translation keys present in en.json`, () => {
        const missingInTarget = enKeys.filter((k) => !Object.prototype.hasOwnProperty.call(targetFlat, k))
        if (missingInTarget.length > 0) {
          console.warn(`[${lang}] Missing ${missingInTarget.length} keys:`, missingInTarget)
        }
        expect(missingInTarget).toEqual([])
      })

      it(`does not contain orphaned keys absent from en.json`, () => {
        const extraInTarget = targetKeys.filter((k) => !Object.prototype.hasOwnProperty.call(enFlat, k))
        if (extraInTarget.length > 0) {
          console.warn(`[${lang}] Extra ${extraInTarget.length} keys:`, extraInTarget)
        }
        expect(extraInTarget).toEqual([])
      })

      it(`preserves required interpolation variables identical to English`, () => {
        const mismatchedVars: string[] = []
        for (const key of enKeys) {
          if (targetFlat[key]) {
            const enVars = extractVariables(enFlat[key])
            const targetVars = extractVariables(targetFlat[key])
            if (enVars.join(',') !== targetVars.join(',')) {
              mismatchedVars.push(
                `${key} (en: [${enVars.join(',')}], ${lang}: [${targetVars.join(',')}])`
              )
            }
          }
        }
        expect(mismatchedVars).toEqual([])
      })

      it(`does not use unapproved "Finance Team" or "Finance User" in user copy`, () => {
        const forbiddenPhrases = ['Finance Team', 'Finance User']
        const violations: string[] = []
        for (const [key, text] of Object.entries(targetFlat)) {
          for (const phrase of forbiddenPhrases) {
            if (text.includes(phrase)) {
              violations.push(`${key}: "${text}" contains "${phrase}"`)
            }
          }
        }
        expect(violations).toEqual([])
      })

      it(`reports keys identical to English`, () => {
        const identical = enKeys.filter((k) => targetFlat[k] === enFlat[k])
        expect(identical.length).toBeLessThan(enKeys.length / 2)
      })
    })
  }

  describe('Reactive Language Switching Parity for Signup & Interface', () => {
    it('reactively switches all three signup categories and form labels when language changes', async () => {
      // 1. Initial English
      await i18n.changeLanguage('en')
      expect(i18n.t('authentication.auditorCardTitle')).toBe('Auditor')
      expect(i18n.t('authentication.auditorCardBadge')).toBe('Audit Firm')
      expect(i18n.t('authentication.accountingTeam')).toBe('Accounting Team')
      expect(i18n.t('authentication.selfRegistration')).toBe('Self Registration')
      expect(i18n.t('authentication.auditorInvitation')).toBe('Auditor Invitation')
      expect(i18n.t('authentication.firmNameLabel')).toBe('Audit Firm Name')
      expect(i18n.t('authentication.companyNameLabel')).toBe('Company Name')
      expect(i18n.t('authentication.createAuditorAccountButton')).toBe('Create Auditor Account')

      // 2. Switch to Igbo (ig)
      await i18n.changeLanguage('ig')
      expect(i18n.t('authentication.auditorCardTitle')).toBe('Onye Nnyocha Ego')
      expect(i18n.t('authentication.auditorCardBadge')).toBe('Ụlọ Ọrụ Nnyocha Ego')
      expect(i18n.t('authentication.accountingTeam')).toBe('Otu Ndekọ Ego')
      expect(i18n.t('authentication.selfRegistration')).toBe('Ndebanye Aha Onwe')
      expect(i18n.t('authentication.auditorInvitation')).toBe('Ọkpụkpọ Òkù Onye Nnyocha')
      expect(i18n.t('authentication.firmNameLabel')).toBe('Aha Ụlọ Ọrụ Nnyocha Ego')
      expect(i18n.t('authentication.companyNameLabel')).toBe('Aha Ụlọ Ọrụ')
      expect(i18n.t('authentication.createAuditorAccountButton')).toBe('Mepụta Akaụntụ Onye Nnyocha Ego')

      // 3. Switch to Yoruba (yo)
      await i18n.changeLanguage('yo')
      expect(i18n.t('authentication.auditorCardTitle')).toBe('Olùṣàyẹ̀wò Owó')
      expect(i18n.t('authentication.auditorCardBadge')).toBe('Ilé-Iṣẹ́ Àyẹ̀wò Owó')
      expect(i18n.t('authentication.accountingTeam')).toBe('Ẹgbẹ́ Ìṣirò Owó')
      expect(i18n.t('authentication.selfRegistration')).toBe('Ìforúkọsílẹ̀ Fúnraẹni')
      expect(i18n.t('authentication.auditorInvitation')).toBe('Ìpè Olùṣàyẹ̀wò Owó')
      expect(i18n.t('authentication.firmNameLabel')).toBe('Orúkọ Ilé-Iṣẹ́ Àyẹ̀wò Owó')
      expect(i18n.t('authentication.companyNameLabel')).toBe('Orúkọ Ilé-Iṣẹ́')
      expect(i18n.t('authentication.createAuditorAccountButton')).toBe('Ṣẹ̀dá Àkọọ́lẹ̀ Olùṣàyẹ̀wò')

      // 4. Switch to Hausa (ha)
      await i18n.changeLanguage('ha')
      expect(i18n.t('authentication.auditorCardTitle')).toBe('Mai Binciken Kuɗi')
      expect(i18n.t('authentication.auditorCardBadge')).toBe('Kamfanin Binciken Kuɗi')
      expect(i18n.t('authentication.accountingTeam')).toBe('Ƙungiyar Ƙididdigar Kuɗi')
      expect(i18n.t('authentication.selfRegistration')).toBe('Rajistar Kai')
      expect(i18n.t('authentication.auditorInvitation')).toBe('Gayyatar Mai Binciken Kuɗi')
      expect(i18n.t('authentication.firmNameLabel')).toBe('Sunan Kamfanin Binciken Kuɗi')
      expect(i18n.t('authentication.companyNameLabel')).toBe('Sunan Kamfani')
      expect(i18n.t('authentication.createAuditorAccountButton')).toBe('Ƙirƙiri Asusun Mai Binciken Kuɗi')

      // 5. Switch to Nigerian Pidgin (pcm)
      await i18n.changeLanguage('pcm')
      expect(i18n.t('authentication.auditorCardTitle')).toBe('Auditor')
      expect(i18n.t('authentication.auditorCardBadge')).toBe('Audit Firm')
      expect(i18n.t('authentication.accountingTeam')).toBe('Accounting Team')
      expect(i18n.t('authentication.selfRegistration')).toBe('Self Registration')
      expect(i18n.t('authentication.auditorInvitation')).toBe('Auditor Invitation')
      expect(i18n.t('authentication.firmNameLabel')).toBe('Audit Firm Name')
      expect(i18n.t('authentication.companyNameLabel')).toBe('Company Name')
      expect(i18n.t('authentication.createAuditorAccountButton')).toBe('Create Auditor Account')

      // 6. Reset to English
      await i18n.changeLanguage('en')
      expect(i18n.t('authentication.accountingTeam')).toBe('Accounting Team')
    })
  })
})
