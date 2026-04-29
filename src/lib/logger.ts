/**
 * Testorum Logger
 *
 * Phase 1: console 기반 로깅
 * Phase 2: Sentry integration 예정 (logger.error → Sentry.captureException)
 */

function formatTimestamp(): string {
  return new Date().toISOString();
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export const logger = {
  error: (context: string, error: unknown, meta?: Record<string, unknown>) => {
    console.error(
      `[Testorum Error] [${formatTimestamp()}] ${context}:`,
      sanitizeError(error),
      meta ? JSON.stringify(meta) : ''
    );
    // Phase 2: Sentry.captureException(error, { extra: { context, ...meta } });
  },

  warn: (context: string, message: string, meta?: Record<string, unknown>) => {
    console.warn(
      `[Testorum Warn] [${formatTimestamp()}] ${context}: ${message}`,
      meta ? JSON.stringify(meta) : ''
    );
  },

  info: (context: string, message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Testorum] [${formatTimestamp()}] ${context}: ${message}`,
        meta ? JSON.stringify(meta) : ''
      );
    }
  },
};
