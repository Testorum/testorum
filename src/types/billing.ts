// =============================================================
// Billing & Credits Type Definitions
// =============================================================

// -- Enums as union types (matches DB CHECK constraints) --

export type SubscriptionPlan = 'free' | 'pro' | 'creator' | 'business';

export type SubscriptionStatus =
  | 'active'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired';

export type BillingInterval = 'monthly' | 'yearly';

export type CreditTransactionType =
  | 'spend'
  | 'refill'
  | 'purchase'
  | 'reward'
  | 'referral';

export type PaymentType = 'subscription' | 'credit_purchase';

export type ReferralStatus = 'pending' | 'completed' | 'expired';

export type MilestoneType =
  | 'views_100'
  | 'views_500'
  | 'views_1000'
  | 'views_5000';

// -- DB Row Types --

export interface Subscription {
  id: string;
  user_id: string;
  lemonsqueezy_subscription_id: string;
  plan: SubscriptionPlan;
  variant_id: string;
  status: SubscriptionStatus;
  billing_interval: BillingInterval | null;
  current_period_end: string | null;
  customer_portal_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  balance: number;
  cap: number;
  frozen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: CreditTransactionType;
  amount: number;
  reason: string | null;
  balance_after: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  lemonsqueezy_order_id: string | null;
  payment_type: PaymentType;
  amount_usd: number; // cents
  status: string;
  variant_id: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: ReferralStatus;
  credits_awarded: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface Milestone {
  id: string;
  test_id: string;
  milestone_type: MilestoneType;
  reached_at: string;
  credits_awarded: boolean;
  owner_id: string;
}

export interface LemonSqueezyEvent {
  id: string;
  event_id: string;
  event_type: string;
  processed_at: string;
}

// -- PG Function Return Types --

export interface DeductCreditsResult {
  success: boolean;
  new_balance?: number;
  error?: 'frozen' | 'insufficient' | 'no_credits' | string;
  current_balance?: number;
}

export interface AddCreditsResult {
  success: boolean;
  new_balance: number;
  capped: boolean;
  error?: string;
}

// -- Plan Configuration --

export interface PlanConfig {
  name: string;
  price_monthly: number; // USD
  price_yearly: number | null;
  credits_monthly: number;
  variant_ids: {
    monthly: string | null;
    yearly: string | null;
  };
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    name: 'Free',
    price_monthly: 0,
    price_yearly: null,
    credits_monthly: 0,
    variant_ids: { monthly: null, yearly: null },
    features: [
      'Unlimited test participation',
      'Ad-supported',
    ],
  },
  pro: {
    name: 'Pro',
    price_monthly: 4.99,
    price_yearly: 39.99,
    credits_monthly: 50,
    variant_ids: {
      monthly: process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY ?? '',
      yearly: process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY ?? '',
    },
    features: [
      'Ad-free experience',
      'Deep analysis reports',
      'HD result cards (no watermark)',
      'Compatibility comparison',
      '50 credits / month',
    ],
  },
  creator: {
    name: 'Creator',
    price_monthly: 9.99,
    price_yearly: 89.99,
    credits_monthly: 200,
    variant_ids: {
      monthly: process.env.LEMONSQUEEZY_VARIANT_CREATOR_MONTHLY ?? '',
      yearly: process.env.LEMONSQUEEZY_VARIANT_CREATOR_YEARLY ?? '',
    },
    features: [
      'All Pro features',
      'Test Builder (Phase B)',
      '200 credits / month',
    ],
  },
  business: {
    name: 'Business',
    price_monthly: 29.99,
    price_yearly: null,
    credits_monthly: 1000,
    variant_ids: {
      monthly: process.env.LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY ?? '',
      yearly: null,
    },
    features: [
      'All Creator features',
      'API access',
      'White-label',
      '1000 credits / month',
    ],
  },
} as const;

// -- Credit Costs --

export const CREDIT_COSTS = {
  deep_analysis: 5,
  hd_result_card: 2,
  compatibility_comparison: 3,
  credit_pack_amount: 50,
  credit_pack_price_usd: 1.99,
  // Phase B
  test_creation: 30,
  archive_reactivation: 15,
} as const;

// -- Referral Rewards --

export const REFERRAL_REWARDS = {
  referrer: 20,
  referred: 10,
} as const;

// -- Milestone Rewards (Phase B) --

export const MILESTONE_REWARDS: Record<MilestoneType, number> = {
  views_100: 5,
  views_500: 30,
  views_1000: 80,
  views_5000: 500,
} as const;

// -- LemonSqueezy Webhook Event Types --

export type LSWebhookEventType =
  | 'order_created'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_payment_success'
  | 'subscription_expired';

export interface LSWebhookPayload {
  meta: {
    event_name: LSWebhookEventType;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

// -- Variant ID Lookup Helper --

export function getVariantId(
  plan: Exclude<SubscriptionPlan, 'free'>,
  interval: BillingInterval
): string {
  const config = PLAN_CONFIGS[plan];
  const variantId = config.variant_ids[interval];
  if (!variantId) {
    throw new Error(`No variant ID for ${plan}/${interval}`);
  }
  return variantId;
}

export function getCreditPackVariantId(): string {
  const id = process.env.LEMONSQUEEZY_VARIANT_CREDIT_PACK;
  if (!id) {
    throw new Error('Missing LEMONSQUEEZY_VARIANT_CREDIT_PACK env var');
  }
  return id;
}
