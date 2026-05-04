// src/components/LocaleSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const localeLabels: Record<Locale, string> = {
    en: '🌐 EN',
    ko: '🇰🇷 KO',
};

export function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (newLocale: string) => {
        // 쿠키에 선호 언어 저장 (next-intl이 NEXT_LOCALE 쿠키 자동 인식)
        const secure = window.location.protocol === 'https:' ? ';Secure' : '';
        document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax${secure}`;
        router.replace(pathname, { locale: newLocale as Locale });
    };

    return (
        <div className="relative">
            <select
                value={locale}
                onChange={(e) => handleChange(e.target.value)}
                className="appearance-none bg-transparent border border-border rounded-md px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Select language"
            >
                {routing.locales.map((l) => (
                    <option key={l} value={l}>
                        {localeLabels[l]}
                    </option>
                ))}
            </select>
        </div>
    );
}
