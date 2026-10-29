import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_CONFIG, type SupportedLocale } from '@/config/app.config'
import { LANGUAGE_OPTIONS, setAppLanguage } from '@/i18n'

export const useLanguage = () => {
  const { i18n, t } = useTranslation()
  const rawLang = i18n.resolvedLanguage || i18n.language || 'en'
  const baseCode = rawLang.split('-')[0].toLowerCase() as SupportedLocale
  const currentLocale: SupportedLocale = (APP_CONFIG.supportedLocales as readonly string[]).includes(rawLang)
    ? (rawLang as SupportedLocale)
    : (APP_CONFIG.supportedLocales as readonly string[]).includes(baseCode)
    ? baseCode
    : APP_CONFIG.defaultLocale

  const changeLanguage = useCallback((code: SupportedLocale) => {
    setAppLanguage(code)
  }, [])

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === currentLocale) || LANGUAGE_OPTIONS[0]

  return {
    currentLocale,
    currentOption,
    options: LANGUAGE_OPTIONS,
    changeLanguage,
    t,
  }
}
