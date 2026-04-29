'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('Error');
  const tc = useTranslations('Common');

  useEffect(() => {
    logger.error('ErrorBoundary', error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="text-6xl mb-6" aria-hidden="true">
          ⚡
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t('serverError')}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {t('serverErrorDesc')}
        </p>

        {/* Retry Button */}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          🔄 {tc('retry')}
        </button>

        {/* Home Link */}
        <p className="mt-4">
          <a
            href="/"
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            {t('goHome')}
          </a>
        </p>
      </div>
    </div>
  );
}
