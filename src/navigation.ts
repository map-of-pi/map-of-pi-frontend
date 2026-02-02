import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '../i18n/i18n';

export const localePrefix = 'always';

export const { Link, redirect, usePathname, useRouter } = 
  createNavigation({
    locales,
    localePrefix,
    defaultLocale,
  });