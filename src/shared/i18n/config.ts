import './types'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { z } from 'zod'

import en, { zod as zodEn } from './locales/en'
import { zodErrorMap } from './zod-error-map'

export const resources = {
  en: { translation: en, zod: zodEn },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

z.setErrorMap(zodErrorMap)

export default i18n
export { z }
