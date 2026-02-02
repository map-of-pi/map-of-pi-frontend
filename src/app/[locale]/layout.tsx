import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { Lato } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import { locales } from '../../../i18n/i18n';
import { Providers } from '../providers';
import Navbar from '@/components/shared/navbar/Navbar';
import logger from '../../../logger.config.mjs';

const lato = Lato({ weight: '400', subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

// Corrected generateStaticParams (must return array of objects)
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure next-intl sees the selected locale
  setRequestLocale(locale);

  // Load messages on the server
  const messages = await getMessages({ locale });

  logger.info(`Rendering LocaleLayout for locale: ${locale}`);
  logger.info('Messages loaded successfully.');

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={`bg-background text-black ${lato.className}`}>
        <Providers>
          <Navbar />
          <div className="pt-[80px]">
            {children}
          </div>
          <ToastContainer />
        </Providers>
      </div>
    </NextIntlClientProvider>
  );
}