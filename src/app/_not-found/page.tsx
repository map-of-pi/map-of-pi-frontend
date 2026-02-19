'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/shared/Forms/Buttons/Buttons';

/**
 * Dynamic configuration:
 * Forces dynamic rendering to ensure translations are resolved correctly 
 * based on the active user locale during runtime.
 */
export const dynamic = 'force-dynamic';

/**
 * NotFound Component
 * Standardized 404 Error page for the Pi Network ecosystem.
 * Designed with minimal dependencies to ensure high availability and fast rendering.
 */
export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      {/* Visual Error Code */}
      <div className="mb-6">
        <h1 className="text-6xl md:text-8xl font-extrabold text-primary opacity-20">
          404
        </h1>
      </div>

      {/* Localized Error Content */}
      <div className="max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          {t('ERROR.PAGE_NOT_FOUND_HEADER')}
        </h2>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          {t('ERROR.PAGE_NOT_FOUND_MESSAGE')}
        </p>

        {/* Action Button: Redirecting user back to safety (Home) */}
        <div className="flex justify-center">
          <Link href="/">
            <Button
              label={t('SHARED.BACK_TO_HOME') || 'Back to Home'}
              styles={{
                height: '50px',
                padding: '0 30px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffc153',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            />
          </Link>
        </div>
      </div>

      {/* Decorative Branding Element */}
      <div className="mt-12 opacity-40">
        <p className="text-xs tracking-widest uppercase text-gray-400">
          Map of Pi Ecosystem
        </p>
      </div>
    </div>
  );
}
