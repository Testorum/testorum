// ============================================================
// src/lib/rate-limit.ts
// Upstash Redis 기반 레이트 리미팅 (Vercel Edge/Serverless 호환)
// ============================================================

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ─── Redis Client (singleton) ───
// Vercel Upstash Integration이 자동 설정한 환경변수 사용
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN env vars');
  }

  _redis = new Redis({ url, token });
  return _redis;
}

// ─── Rate Limiters ───

/**
 * 글로벌 API 레이트 리미팅 (미들웨어)
 * 60 requests / 1 minute per IP
 */
export const globalApiLimiter = new Ratelimit({
  redis: new Proxy({} as Redis, {
    get(_, prop) { return Reflect.get(getRedis(), prop); },
  }),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'rl:global',
  analytics: true,
});

/**
 * 궁합 비교 세션 생성 레이트 리미팅
 * 20 requests / 1 minute per IP
 */
export const compareCreateLimiter = new Ratelimit({
  redis: new Proxy({} as Redis, {
    get(_, prop) { return Reflect.get(getRedis(), prop); },
  }),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:compare',
  analytics: true,
});

/**
 * 댓글 중복 방지
 * 같은 IP + test_slug + result_id 조합으로 10초 내 재댓글 차단
 *
 * @returns true if duplicate (should block)
 */
export async function isDuplicateComment(
  ip: string,
  testSlug: string,
  resultId: string
): Promise<boolean> {
  const redis = getRedis();
  const key = `rl:comment:${ip}:${testSlug}:${resultId}`;

  // SET key 1 NX EX 10 — key 없으면 설정 + 10초 TTL
  // NX: key가 이미 존재하면 null 반환 (= 중복)
  const result = await redis.set(key, 1, { nx: true, ex: 10 });

  // result === 'OK' → 새 댓글 (허용)
  // result === null → 중복 (차단)
  return result === null;
}
