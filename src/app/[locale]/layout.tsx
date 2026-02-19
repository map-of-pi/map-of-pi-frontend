import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { Lato } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import { locales } from '../../../i18n/i18n';
import { Providers } from '../providers';
import Navbar from '@/components/shared/navbar/Navbar';
import logger from '../../../logger.config.mjs';

// Configuration for the Lato font to ensure consistent typography across the ecosystem
const lato = Lato({ weight: '400', subsets: ['latin'], display: 'swap' });

/**
 * Dynamic rendering configuration.
 * Set to 'force-dynamic' to ensure real-time user session and locale synchronization.
 */
export const dynamic = 'force-dynamic';

/**
 * Generates static parameters for all supported locales.
 * Critical for Next.js build-time optimization and routing.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * LocaleLayout Component
 * The root layout for all localized routes. Responsible for:
 * 1. Initializing i18n messages for client-side use.
 * 2. Wrapping the application with necessary Global Context Providers.
 * 3. Defining the common UI architecture (Navbar, Toast, and Main Content).
 */
export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Sync the current request locale with next-intl server-side utilities
  setRequestLocale(locale);

  /**
   * Fetch localized messages.
   * Leverages the 60s global timeout logic for high availability in slow connections.
   */
  const messages = await getMessages({ locale });

  logger.info(`System rendering started for locale: [${locale.toUpperCase()}]`);
  
  if (!messages) {
    logger.error(`Critical Error: Failed to load messages for locale: ${locale}`);
  } else {
    logger.info('Internationalization messages injected successfully.');
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={`bg-background text-black ${lato.className} min-h-screen`}>
        {/* Providers component contains the AppContextProvider which handles 
           the core logic for authentication, Pi SDK integration, and state management.
        */}
        <Providers>
          {/* Global Navigation Bar - Persistent across all sub-routes */}
          <Navbar />
          
          {/* Main content area with padding-top to account for the fixed navbar height.
             Includes a fade-in animation container for smoother transitions.
          */}
          <main className="pt-[80px] animate-fadeIn">
            {children}
          </main>

          {/* Toast notifications container for global feedback (Errors, Success, Info) */}
          <ToastContainer 
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={locale === 'ar'} // Basic RTL support logic
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
      </div>
    </NextIntlClientProvider>
  );
}
