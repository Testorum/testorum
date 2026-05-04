// ============================================================
// Feature Flags — UI-level on/off switches
// Flip to `true` to re-enable the feature across the app.
// ============================================================

export const FEATURES = {
  /** LemonSqueezy payment system (pricing / billing / paywall) */
  PAYMENT_ENABLED: false,

  /** Creator UGC (test builder) */
  CREATOR_ENABLED: false,
} as const;
