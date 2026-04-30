// ═══════════════════════════════════════════════════════════════
// Tori Brain — Provider pattern for mascot message generation
// Phase A: Preset message pool (random)
// Phase B: ARIA API call (swap this file only)
// ═══════════════════════════════════════════════════════════════

import type { ToriMood, ToriResponse } from '@/types'

// ─── Provider interface ────────────────────────────────────────

export interface ToriBrainProvider {
  getMessage(params: {
    mood: ToriMood
    locale: string
    context?: string       // Phase B: behavior data context
    testSlug?: string
  }): Promise<ToriResponse>
}

// ─── Emoji map ─────────────────────────────────────────────────

export const TORI_EMOJI: Record<ToriMood, string> = {
  happy: '😊',
  curious: '🤔',
  excited: '🤩',
  smug: '😏',
  surprised: '😮',
  celebrating: '🎉',
  sad: '😢',
  thinking: '💭',
}

// ─── Preset message pool ───────────────────────────────────────

const TORI_MESSAGES: Record<ToriMood, { en: string[]; ko: string[] }> = {
  happy: {
    en: [
      'Nice to see you!',
      'Hey there! Ready for something fun?',
      'Welcome back! 😊',
      'Oh hi! This is gonna be good',
    ],
    ko: [
      '반가워!',
      '오 왔구나!',
      '또 만났네 😊',
      '오늘도 테스트 하러 왔어?',
    ],
  },
  curious: {
    en: [
      'Hmm interesting...',
      'I wonder what you\'ll pick 🤔',
      'This one\'s tricky...',
      'Ooh tell me more about yourself',
    ],
    ko: [
      '오 흥미로운데...',
      '뭘 고를지 궁금하다 🤔',
      '이건 좀 어려울걸...',
      '오호~ 점점 재밌어지는데',
    ],
  },
  excited: {
    en: [
      'This test is SO fun!',
      'I love this one! Let\'s go!',
      'Ooh you picked a good one! 🔥',
    ],
    ko: [
      '이 테스트 진짜 재밌어!',
      '이거 좋아! 시작하자!',
      '오 이거 골랐구나 🔥',
    ],
  },
  smug: {
    en: [
      'I already know your type 😏',
      'Trust me... I\'ve seen this before',
      'Oh this is gonna be good',
      'I bet I can guess your result already',
    ],
    ko: [
      '나 이미 답 알아 😏',
      '이 조합 본 적 있는데...',
      '이거 재밌겠다',
      '벌써 결과 예측됨ㅋ',
    ],
  },
  surprised: {
    en: [
      'Wait really?! 😮',
      'Didn\'t expect that!',
      'Oh wow that\'s an interesting choice',
      'Hmm I didn\'t see that coming',
    ],
    ko: [
      '엥 진짜?! 😮',
      '이거 의외인데!',
      '오 그걸 골랐어?',
      '헐 예상 밖이다',
    ],
  },
  celebrating: {
    en: [
      'You did it! 🎉',
      'Results are in!',
      'Ta-da! ✨',
      'Drumroll please... 🥁',
    ],
    ko: [
      '끝났다! 🎉',
      '결과 나왔어!',
      '짜잔! ✨',
      '두구두구두구... 🥁',
    ],
  },
  sad: {
    en: [
      'Aww don\'t go yet...',
      'I was having fun though 😢',
      'Come back soon okay?',
    ],
    ko: [
      '에이 벌써 가려고...',
      '나 재밌었는데 😢',
      '빨리 또 와!',
    ],
  },
  thinking: {
    en: [
      'Let me think about this...',
      'Hmm this is a tough one 💭',
      'Processing your answers...',
    ],
    ko: [
      '잠깐 생각 좀...',
      '이거 좀 어렵다 💭',
      '답변 분석 중...',
    ],
  },
}

// ─── Test-specific custom messages ─────────────────────────────

const TEST_CUSTOM_MESSAGES: Record<string, Partial<Record<ToriMood, { en: string; ko: string }>>> = {
  t01: {
    curious: {
      en: 'Your dating style... I\'m dying to know 😏',
      ko: '연애 스타일 궁금하지? 😏',
    },
    celebrating: {
      en: 'Your flirting DNA has been decoded! 💕',
      ko: '너의 썸 유전자 분석 완료! 💕',
    },
  },
  t02: {
    smug: {
      en: 'Red flags? I can spot them all 🚩',
      ko: '레드플래그? 나한테 다 보여 🚩',
    },
  },
  t03: {
    curious: {
      en: 'Your reply style says a LOT about you',
      ko: '답장 스타일이 성격을 말해준다니까',
    },
  },
  t04: {
    surprised: {
      en: 'This one hits different... 🥺',
      ko: '이건 좀 찔릴 수 있어... 🥺',
    },
  },
  t05: {
    excited: {
      en: 'Time to check your romance stats! ⚔️',
      ko: '로맨스 능력치 측정 갑니다! ⚔️',
    },
  },
}

// ─── Phase A: Preset provider ──────────────────────────────────

class PresetToriBrain implements ToriBrainProvider {
  async getMessage(params: {
    mood: ToriMood
    locale: string
    context?: string
    testSlug?: string
  }): Promise<ToriResponse> {
    const { mood, locale, testSlug } = params
    const lang = locale === 'ko' ? 'ko' : 'en'

    // Check test-specific message first
    if (testSlug && TEST_CUSTOM_MESSAGES[testSlug]?.[mood]) {
      const custom = TEST_CUSTOM_MESSAGES[testSlug][mood]!
      return {
        message: custom[lang],
        mood,
        data_driven: false,
      }
    }

    // Random from pool
    const pool = TORI_MESSAGES[mood]?.[lang]
    if (!pool || pool.length === 0) {
      return {
        message: lang === 'ko' ? '안녕!' : 'Hey!',
        mood: 'happy',
        data_driven: false,
      }
    }

    const idx = Math.floor(Math.random() * pool.length)
    return {
      message: pool[idx],
      mood,
      data_driven: false,
    }
  }
}

// ─── Phase B: ARIA provider (prepared / not exported) ──────────
//
// class AriaToriBrain implements ToriBrainProvider {
//   private apiUrl: string
//   private apiKey: string
//
//   constructor() {
//     this.apiUrl = process.env.NEXT_PUBLIC_ARIA_API_URL!
//     this.apiKey = process.env.ARIA_API_KEY!
//   }
//
//   async getMessage(params: {
//     mood: ToriMood
//     locale: string
//     context?: string
//     testSlug?: string
//   }): Promise<ToriResponse> {
//     const res = await fetch(`${this.apiUrl}/v1/query`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-API-Key': this.apiKey,
//       },
//       body: JSON.stringify({
//         query: `Generate a short ${params.mood} message for Tori mascot in ${params.locale}. Context: ${params.context ?? 'general greeting'}`,
//         collection: 'testorum_tori',
//         model_tier: 'cheap',
//         context: [],
//       }),
//     })
//
//     if (!res.ok) {
//       // Fallback to preset on ARIA failure
//       const fallback = new PresetToriBrain()
//       return fallback.getMessage(params)
//     }
//
//     const data = await res.json()
//     return {
//       message: data.answer,
//       mood: params.mood,
//       data_driven: true,
//     }
//   }
// }

// ─── Factory ───────────────────────────────────────────────────

let _instance: ToriBrainProvider | null = null

export function createToriBrain(): ToriBrainProvider {
  if (_instance) return _instance

  // Phase B activation check
  // if (process.env.NEXT_PUBLIC_ARIA_API_URL) {
  //   _instance = new AriaToriBrain()
  //   return _instance
  // }

  _instance = new PresetToriBrain()
  return _instance
}

// ─── Convenience helper ────────────────────────────────────────

export async function getToriMessage(
  mood: ToriMood,
  locale: string,
  testSlug?: string
): Promise<ToriResponse> {
  const brain = createToriBrain()
  return brain.getMessage({ mood, locale, testSlug })
}
