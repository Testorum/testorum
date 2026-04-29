/**
 * Testorum Input Validation
 *
 * 서버사이드 검증 유틸리티
 * API Route + OG Route에서 공통 사용
 */

// ─── Types ───
export type EmojiType = 'shocked' | 'lol' | 'think';

export interface FeedbackInput {
  test_slug: string;
  result_id: string;
  emoji: EmojiType;
}

export interface CommentInput {
  test_slug: string;
  result_id: string;
  content: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Constants ───
const VALID_EMOJIS: ReadonlySet<string> = new Set(['shocked', 'lol', 'think']);
const SLUG_PATTERN = /^[a-z0-9_-]{1,20}$/;
const RESULT_ID_PATTERN = /^[a-z0-9_-]{1,20}$/;
const COMMENT_MAX_LENGTH = 100;
const COMMENT_MIN_LENGTH = 1;

// ─── Sanitization ───

/** HTML 태그 제거 */
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** 앞뒤 공백 제거 + 연속 공백 단일화 */
function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

// ─── Validators ───

export function validateSlug(slug: unknown): ValidationResult<string> {
  if (typeof slug !== 'string') {
    return { success: false, error: 'test_slug must be a string' };
  }
  const cleaned = slug.trim().toLowerCase();
  if (!SLUG_PATTERN.test(cleaned)) {
    return {
      success: false,
      error: 'test_slug must be 1-20 chars (lowercase alphanumeric, underscore, hyphen)',
    };
  }
  return { success: true, data: cleaned };
}

export function validateResultId(resultId: unknown): ValidationResult<string> {
  if (typeof resultId !== 'string') {
    return { success: false, error: 'result_id must be a string' };
  }
  const cleaned = resultId.trim().toLowerCase();
  if (!RESULT_ID_PATTERN.test(cleaned)) {
    return {
      success: false,
      error: 'result_id must be 1-20 chars (lowercase alphanumeric, underscore, hyphen)',
    };
  }
  return { success: true, data: cleaned };
}

export function validateEmoji(emoji: unknown): ValidationResult<EmojiType> {
  if (typeof emoji !== 'string') {
    return { success: false, error: 'emoji must be a string' };
  }
  if (!VALID_EMOJIS.has(emoji)) {
    return {
      success: false,
      error: `emoji must be one of: ${[...VALID_EMOJIS].join(', ')}`,
    };
  }
  return { success: true, data: emoji as EmojiType };
}

export function validateCommentContent(content: unknown): ValidationResult<string> {
  if (typeof content !== 'string') {
    return { success: false, error: 'content must be a string' };
  }

  // Sanitize: strip HTML, normalize whitespace
  let cleaned = stripHtmlTags(content);
  cleaned = normalizeWhitespace(cleaned);

  if (cleaned.length < COMMENT_MIN_LENGTH) {
    return { success: false, error: 'content must not be empty' };
  }
  if (cleaned.length > COMMENT_MAX_LENGTH) {
    return {
      success: false,
      error: `content must be ${COMMENT_MAX_LENGTH} characters or less`,
    };
  }

  return { success: true, data: cleaned };
}

// ─── Composite Validators ───

export function validateFeedbackInput(body: unknown): ValidationResult<FeedbackInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body must be a JSON object' };
  }

  const obj = body as Record<string, unknown>;

  const slugResult = validateSlug(obj.test_slug);
  if (!slugResult.success) return { success: false, error: slugResult.error };

  const resultIdResult = validateResultId(obj.result_id);
  if (!resultIdResult.success) return { success: false, error: resultIdResult.error };

  const emojiResult = validateEmoji(obj.emoji);
  if (!emojiResult.success) return { success: false, error: emojiResult.error };

  return {
    success: true,
    data: {
      test_slug: slugResult.data!,
      result_id: resultIdResult.data!,
      emoji: emojiResult.data!,
    },
  };
}

export function validateCommentInput(body: unknown): ValidationResult<CommentInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Request body must be a JSON object' };
  }

  const obj = body as Record<string, unknown>;

  const slugResult = validateSlug(obj.test_slug);
  if (!slugResult.success) return { success: false, error: slugResult.error };

  const resultIdResult = validateResultId(obj.result_id);
  if (!resultIdResult.success) return { success: false, error: resultIdResult.error };

  const contentResult = validateCommentContent(obj.content);
  if (!contentResult.success) return { success: false, error: contentResult.error };

  return {
    success: true,
    data: {
      test_slug: slugResult.data!,
      result_id: resultIdResult.data!,
      content: contentResult.data!,
    },
  };
}

// ─── OG Route Validators ───

const OG_SLUG_PATTERN = /^[a-z0-9-]{1,30}$/;
const OG_RESULT_PATTERN = /^[a-z0-9_]{1,30}$/;

export function validateOgSlug(slug: string | null): string | null {
  if (!slug) return null;
  return OG_SLUG_PATTERN.test(slug) ? slug : null;
}

export function validateOgResult(result: string | null): string | null {
  if (!result) return null;
  return OG_RESULT_PATTERN.test(result) ? result : null;
}
