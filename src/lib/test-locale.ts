import type {
  TestData,
  TestDataRaw,
  TestDataWithPremium,
  PremiumResult,
  LocaleData,
} from '@/types'

/**
 * locale_data 구조에서 특정 locale 값을 추출합니다.
 * 해당 locale이 없으면 'en' fallback → 그것도 없으면 첫 번째 키 사용
 */
function resolve<T>(localeData: LocaleData<T>, locale: string): T {
  return localeData[locale] ?? localeData['en'] ?? Object.values(localeData)[0]
}

/**
 * Raw JSON (locale_data 구조) → flat TestData 변환
 * 기존 컴포넌트가 사용하는 TestData 타입과 100% 호환
 */
export function getLocalizedTest(raw: TestDataRaw, locale: string): TestDataWithPremium {
  const meta = resolve(raw.meta.locale_data, locale)
  const questions = raw.questions.map((q) => {
    const qLocale = resolve(q.locale_data, locale)
    return {
      id: q.id,
      type: q.type,
      text: qLocale.text,
      options: q.options.map((opt) => {
        const optLocale = resolve(opt.locale_data, locale)
        return {
          text: optLocale.text,
          image: opt.image,
          emoji: opt.emoji,
          scores: opt.scores,
        }
      }),
    }
  })

  const results = raw.results.map((r) => {
    const rLocale = resolve(r.locale_data, locale)
    return {
      id: r.id,
      title: rLocale.title,
      description: rLocale.description,
      emoji: r.emoji,
      emojiCombo: r.emojiCombo,
      tags: rLocale.tags,
      compatibility: rLocale.compatibility,
    }
  })

  // premiumResults 변환
  let premiumResults: Record<string, PremiumResult> | undefined
  if (raw.premiumResults) {
    premiumResults = {}
    for (const [key, pr] of Object.entries(raw.premiumResults)) {
      const prLocale = resolve(pr.locale_data, locale)
      premiumResults[key] = {
        deepAnalysis: prLocale.deepAnalysis,
        strengths: prLocale.strengths,
        weaknesses: prLocale.weaknesses,
        advice: prLocale.advice,
      }
    }
  }

  return {
    meta: {
      slug: raw.meta.slug,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      emoji: raw.meta.emoji,
      category: raw.meta.category,
      estimatedMinutes: raw.meta.estimatedMinutes,
      shareText: meta.shareText,
      theme: raw.meta.theme,
    },
    scoring: raw.scoring,
    questions,
    results,
    premiumResults,
  }
}

/**
 * 특정 결과 ID의 premiumResult만 추출 (flat 변환 후)
 */
export function getLocalizedPremiumResult(
  raw: TestDataRaw,
  resultId: string,
  locale: string
): PremiumResult | null {
  const pr = raw.premiumResults?.[resultId]
  if (!pr) return null
  const prLocale = resolve(pr.locale_data, locale)
  return {
    deepAnalysis: prLocale.deepAnalysis,
    strengths: prLocale.strengths,
    weaknesses: prLocale.weaknesses,
    advice: prLocale.advice,
  }
}
