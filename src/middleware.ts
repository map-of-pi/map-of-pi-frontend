import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '../i18n/i18n';
import { localePrefix } from './navigation';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|.*\\..*).*)'
  ]
};
