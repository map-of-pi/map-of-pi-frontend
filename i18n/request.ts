import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n';

export default getRequestConfig(async ({ locale }) => {
  // locale may be undefined according to types — handle that
  // If locale is not a valid string or is not among supported locales, fallback:
  const finalLocale =
    typeof locale === 'string' && locales.includes(locale as typeof locales[number])
      ? locale
      : defaultLocale;

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});
