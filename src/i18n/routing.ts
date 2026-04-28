import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'ko'] as const,
    defaultLocale: 'en',
    localePrefix: 'always',
    // 추후 확장: 'ja', 'es', 'pt'
});

export type Locale = (typeof routing.locales)[number];
