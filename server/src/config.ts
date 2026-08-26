import 'dotenv/config';

/** Stripe price IDs start with `price_`; plain numbers are treated as display amounts only. */
function parseEnvDisplayPrice(value: string | undefined): number {
  const raw = value?.trim();
  if (!raw || raw.startsWith('price_')) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  appName: process.env.APP_NAME || 'TEF Canada Coach',
  tefPlacementCount: Number(process.env.TEF_PLACEMENT_COUNT) || 6,
  /** TEF practice mini-exam: 14 Q across 7 sections (~35% of full 40 Q exam). */
  tefPracticeCount: Number(process.env.TEF_PRACTICE_COUNT) || 14,
  /** MCQ batches need more output tokens than short writing eval JSON. */
  tefReadingLlmMaxTokens:
    Number(process.env.TEF_READING_LLM_MAX_TOKENS) ||
    Number(process.env.TEF_LLM_MAX_TOKENS) ||
    1200,
  tefWritingLlmMaxTokens:
    Number(process.env.TEF_WRITING_LLM_MAX_TOKENS) ||
    Number(process.env.TEF_LLM_MAX_TOKENS) ||
    800,
  /** @deprecated use tefReadingLlmMaxTokens / tefWritingLlmMaxTokens */
  tefLlmMaxTokens:
    Number(process.env.TEF_LLM_MAX_TOKENS) ||
    Number(process.env.TEF_READING_LLM_MAX_TOKENS) ||
    1200,
  useEvaluator: process.env.TEF_USE_EVALUATOR === 'true',
  useWebsearch: process.env.TEF_USE_WEBSEARCH !== 'false',

  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim() || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || '',
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY?.trim() || '',
  stripePriceYearly: process.env.STRIPE_PRICE_YEARLY?.trim() || '',
  /** Display amounts (USD) shown in UI — use BILLING_PRICE_* or numeric STRIPE_PRICE_* */
  billingPriceMonthly:
    Number(process.env.BILLING_PRICE_MONTHLY) ||
    parseEnvDisplayPrice(process.env.STRIPE_PRICE_MONTHLY) ||
    0,
  billingPriceYearly:
    Number(process.env.BILLING_PRICE_YEARLY) ||
    parseEnvDisplayPrice(process.env.STRIPE_PRICE_YEARLY) ||
    0,
  billingPriceCurrency: (process.env.BILLING_PRICE_CURRENCY?.trim() || 'usd').toLowerCase(),
  /** Days of Pro access after a one-time monthly purchase */
  billingAccessDaysMonthly: Number(process.env.BILLING_ACCESS_DAYS_MONTHLY) || 30,
  /** Days of Pro access after a one-time yearly purchase */
  billingAccessDaysYearly: Number(process.env.BILLING_ACCESS_DAYS_YEARLY) || 365,
  /** Free tier: completed reading practice sessions per calendar day */
  freemiumReadingPerDay: Number(process.env.FREEMIUM_READING_PER_DAY) || 1,
  /** Free tier: writing submissions per calendar day */
  freemiumWritingPerDay: Number(process.env.FREEMIUM_WRITING_PER_DAY) || 1,

  authSecret: process.env.AUTH_SECRET?.trim() || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/auth/callback/google`,
};
