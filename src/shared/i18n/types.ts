import type { zod as zodEn } from './locales/en'
import type en from './locales/en'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
      zod: typeof zodEn
    }
  }
}
