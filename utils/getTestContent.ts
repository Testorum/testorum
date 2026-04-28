// utils/getTestContent.ts (또는 기존 유틸에 추가)
export function getLocalizedTestContent(testData: TestData, locale: string) {
    const localeData = testData.locale_data?.[locale]
        ?? testData.locale_data?.['en']
        ?? null;

    if (!localeData) {
        // fallback to root-level fields (기존 단일언어 호환)
        return {
            title: testData.title,
            description: testData.description,
            questions: testData.questions,
            results: testData.results,
        };
    }

    return localeData;
}
