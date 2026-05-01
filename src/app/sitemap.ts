import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getAllTestSlugs } from '@/lib/tests'

const BASE_URL = 'https://testorum.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales
  const testSlugs = getAllTestSlugs()

  const staticPages = ['', '/about', '/privacy', '/pricing']

  const entries: MetadataRoute.Sitemap = []

  // Static pages
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1.0 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      })
    }
  }

  // Test pages
  for (const slug of testSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/tests/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/tests/${slug}`])
          ),
        },
      })
    }
  }

  return entries
}
