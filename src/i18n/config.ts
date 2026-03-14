// src/i18n/config.ts
// next-intl configuration for EN/ES bilingual support

import { getRequestConfig } from 'next-intl/server';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../contracts/constants';

export const defaultLocale: SupportedLanguage = 'en';
export const locales = SUPPORTED_LANGUAGES;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: SupportedLanguage =
    requested && (locales as readonly string[]).includes(requested)
      ? (requested as SupportedLanguage)
      : defaultLocale;

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
