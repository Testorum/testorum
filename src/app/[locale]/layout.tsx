import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import localFont from 'next/font/local'
import '../globals.css'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import Script from 'next/script'

const pretendard = localFont({
  src: '../../fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  preload: true,
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Meta' })

  return {
    title: {
      default: t('homeTitle'),
      template: '%s | Testorum',
    },
    description: t('homeDescription'),
    metadataBase: new URL('https://testorum.app'),
    alternates: {
      canonical: `https://testorum.app/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://testorum.app/${l}`])
      ),
    },
    openGraph: {
      siteName: 'Testorum',
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === 'ko' ? 'ko_KR' : 'en_US')),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={pretendard.variable}>
      <head>
        {/* hreflang tags */}
        {routing.locales.map((l) => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l}
            href={`https://testorum.app/${l}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://testorum.app/en"
        />

        {/* Naver Search Advisor (ko only) */}
        {locale === 'ko' && (
          <meta
            name="naver-site-verification"
            content={process.env.NEXT_PUBLIC_NAVER_VERIFICATION ?? ''}
          />
        )}

        {/* KakaoTalk SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          integrity=""
        />

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}

        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA4_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className="bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* Floating Language Switcher */}
          <div className="fixed top-3 right-3 z-50">
            <LocaleSwitcher />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
