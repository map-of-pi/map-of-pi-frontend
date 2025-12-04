import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n';

export default getRequestConfig(async ({ locale }) => {
  const finalLocale = locales.includes(locale as typeof locales[number])
    ? locale
    : defaultLocale;

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});
