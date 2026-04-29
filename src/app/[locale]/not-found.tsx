import { useTranslations } from 'next-intl';

export default function NotFoundPage() {
  const t = useTranslations('Error');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Fun Emoji */}
        <div className="text-7xl mb-6" aria-hidden="true">
          🏃‍♂️
        </div>

        {/* 404 Badge */}
        <div className="inline-block px-4 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
          404
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t('notFound')}
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {t('notFoundDesc')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
          >
            🏠 {t('goHome')}
          </a>
          <a
            href="/tests"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
          >
            🧪 {t('browseTests')}
          </a>
        </div>
      </div>
    </div>
  );
}
