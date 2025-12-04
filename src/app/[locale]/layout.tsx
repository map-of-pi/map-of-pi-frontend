// app/[locale]/layout.tsx
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Lato } from 'next/font/google';
import { locales } from '../../../i18n/i18n';
import { Providers } from '../providers';
import Navbar from '@/components/shared/navbar/Navbar';
import logger from '../../../logger.config.mjs';
import { ToastContainer } from 'react-toastify';

const lato = Lato({ weight: '400', subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

// Corrected generateStaticParams (must return array of objects)
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure next-intl sees the selected locale
  setRequestLocale(locale);

  const messages = useMessages();

  logger.info(`Rendering LocaleLayout for locale: ${locale}`);
  logger.info('Messages loaded successfully.');

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <body className={`bg-background text-black ${lato.className}`}>
        <Providers>
          <Navbar />
          <div className="pt-[80px]">{children}</div>
          <ToastContainer />
        </Providers>
      </body>
    </NextIntlClientProvider>
  );
}
