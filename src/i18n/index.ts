import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { APP_CONFIG, type SupportedLocale } from '@/config/app.config'

import en from './locales/en.json'
import yo from './locales/yo.json'
import ig from './locales/ig.json'
import ha from './locales/ha.json'
import pcm from './locales/pcm.json'

export const resources = {
  en: { translation: en },
  yo: { translation: yo },
  ig: { translation: ig },
  ha: { translation: ha },
  pcm: { translation: pcm },
} as const

export interface LanguageOption {
  readonly code: SupportedLocale
  readonly name: string
  readonly nativeName: string
  readonly flag: string
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬' },
  { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Naijá Pidgin', flag: '🇳🇬' },
] as const

const STORAGE_KEY = 'finauditease_locale'

const getInitialLocale = (): SupportedLocale => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
    if (saved && APP_CONFIG.supportedLocales.includes(saved)) {
      return saved
    }
  } catch {
    // Ignore storage errors (e.g. private browsing mode)
  }
  return APP_CONFIG.defaultLocale
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLocale(),
    fallbackLng: APP_CONFIG.defaultLocale,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export const setAppLanguage = (code: SupportedLocale): void => {
  i18n.changeLanguage(code)
  try {
    localStorage.setItem(STORAGE_KEY, code)
    localStorage.setItem('i18nextLng', code)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = code
    }
  } catch {
    // Graceful fallback if localStorage is disabled
  }
}

export default i18n
