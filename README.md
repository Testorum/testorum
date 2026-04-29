# Testorum Security Hardening — 파일 맵 및 적용 가이드

## 파일 목록

### 🆕 새로 만들기 (NEW)
| # | 파일 | 설명 |
|---|------|------|
| 1 | `src/middleware.ts` | next-intl 통합 + Security Headers + Rate Limiting |
| 2 | `src/lib/supabase-server.ts` | Supabase 서버 전용 클라이언트 (service_role) |
| 3 | `src/lib/validation.ts` | 공통 입력값 검증 유틸리티 |
| 4 | `src/lib/logger.ts` | 로깅 유틸리티 (Phase 2: Sentry 연동) |
| 5 | `src/app/api/feedback/route.ts` | Feedback API Route (서버사이드 검증) |
| 6 | `src/app/api/comments/route.ts` | Comments API Route (서버사이드 검증 + 중복 방지) |
| 7 | `src/app/[locale]/error.tsx` | Error Boundary 페이지 |
| 8 | `src/app/[locale]/not-found.tsx` | 404 페이지 |
| 9 | `src/app/[locale]/loading.tsx` | 메인 로딩 스켈레톤 |
| 10 | `src/app/[locale]/tests/[slug]/loading.tsx` | 테스트 전용 로딩 스켈레톤 |
| 11 | `public/robots.txt` | 크롤러 제어 |
| 12 | `.env.example` | 환경변수 템플릿 |
| 13 | `supabase/migrations/001_rls_policies.sql` | RLS 정책 SQL |

### ✏️ 기존 파일 수정 (MODIFY)
| # | 파일 | 변경 내용 | 참조 |
|---|------|-----------|------|
| 14 | `messages/en.json` | Error + NotFound 네임스페이스 추가 | `messages/en.json` (병합) |
| 15 | `messages/ko.json` | Error + NotFound 네임스페이스 추가 | `messages/ko.json` (병합) |
| 16 | `src/app/api/og/route.tsx` | 입력값 검증 + try/catch 추가 | `src/app/api/og/PATCH_INSTRUCTIONS.ts` |
| 17 | `src/components/feedback/FeedbackWidget.tsx` | API Route 호출로 전환 | `src/components/feedback/PATCH_FeedbackWidget.ts` |

## 적용 순서

### Step 1: 새 파일 복사
```bash
# 프로젝트 루트에서 실행
# tar.gz 압축 해제 후 각 파일을 해당 경로로 복사

# 예시 (tar.gz 해제 후):
cp testorum-security/src/middleware.ts src/middleware.ts
cp testorum-security/src/lib/supabase-server.ts src/lib/supabase-server.ts
cp testorum-security/src/lib/validation.ts src/lib/validation.ts
cp testorum-security/src/lib/logger.ts src/lib/logger.ts
cp testorum-security/src/app/api/feedback/route.ts src/app/api/feedback/route.ts
cp testorum-security/src/app/api/comments/route.ts src/app/api/comments/route.ts
cp testorum-security/src/app/\[locale\]/error.tsx src/app/\[locale\]/error.tsx
cp testorum-security/src/app/\[locale\]/not-found.tsx src/app/\[locale\]/not-found.tsx
cp testorum-security/src/app/\[locale\]/loading.tsx src/app/\[locale\]/loading.tsx
mkdir -p src/app/\[locale\]/tests/\[slug\]
cp testorum-security/src/app/\[locale\]/tests/\[slug\]/loading.tsx src/app/\[locale\]/tests/\[slug\]/loading.tsx
cp testorum-security/public/robots.txt public/robots.txt
cp testorum-security/.env.example .env.example
```

### Step 2: 환경변수 추가
```bash
# .env.local에 추가 (Vercel 대시보드에도 설정)
SUPABASE_SERVICE_ROLE_KEY=실제_서비스_롤_키
```

### Step 3: messages 병합
en.json과 ko.json에서 Error, NotFound 객체를 기존 파일에 수동 병합

### Step 4: 기존 파일 수정
- `src/app/api/og/route.tsx` → PATCH_INSTRUCTIONS.ts 참고
- `src/components/feedback/FeedbackWidget.tsx` → PATCH_FeedbackWidget.ts 참고

### Step 5: Supabase RLS 적용
Supabase Dashboard → SQL Editor에서 `001_rls_policies.sql` 전체 실행

### Step 6: 로컬 테스트
```bash
npm run dev
# 다음 확인:
# 1. Security Headers → DevTools > Network > Response Headers
# 2. /api/feedback POST → 정상 201 + 잘못된 입력 시 400
# 3. /nonexistent → 404 페이지 표시
# 4. 강제 에러 → error.tsx 표시
```

### Step 7: 배포
```bash
git add src/middleware.ts src/lib/supabase-server.ts src/lib/validation.ts src/lib/logger.ts
git add src/app/api/feedback/route.ts src/app/api/comments/route.ts
git add "src/app/[locale]/error.tsx" "src/app/[locale]/not-found.tsx" "src/app/[locale]/loading.tsx"
git add "src/app/[locale]/tests/[slug]/loading.tsx"
git add public/robots.txt .env.example
git add messages/en.json messages/ko.json
# ⚠️ OG route와 FeedbackWidget 수정 파일도 add
# ⚠️ git add -A 금지!
git commit -m "feat: production security hardening (headers, RLS, validation, error pages)"
git push origin main
```

## Vercel 환경변수 설정
Vercel Dashboard → Settings → Environment Variables에 추가:
- `SUPABASE_SERVICE_ROLE_KEY` (Production + Preview)
