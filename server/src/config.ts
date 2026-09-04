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
  /** Comma-separated allowed browser origins (defaults to CLIENT_URL). Use for localhost → prod API testing. */
  corsOrigins: (process.env.CORS_ORIGINS?.trim() || process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  /** lax (default) | none — use `none` when the frontend runs on a different site than the API (e.g. localhost → Render). */
  sessionCookieSameSite:
    (process.env.SESSION_COOKIE_SAME_SITE?.trim().toLowerCase() as 'lax' | 'none' | 'strict') ||
    'lax',
  appName: process.env.APP_NAME || 'TEF Canada Coach',
  tefPlacementCount: Number(process.env.TEF_PLACEMENT_COUNT) || 6,
  /** Full reading mock: 40 Q / 7 sections (set 14 for legacy mini session). */
  tefPracticeCount: Number(process.env.TEF_PRACTICE_COUNT) || 40,
  /** MCQ batches need more output tokens than short writing eval JSON. */
  tefReadingLlmMaxTokens:
    Number(process.env.TEF_READING_LLM_MAX_TOKENS) ||
    Number(process.env.TEF_LLM_MAX_TOKENS) ||
    1200,
  tefWritingLlmMaxTokens:
    Number(process.env.TEF_WRITING_LLM_MAX_TOKENS) ||
    Number(process.env.TEF_LLM_MAX_TOKENS) ||
    800,
  /** Optional LLM polish on top of template rubric (default: rubric only) */
  writingUseLlmEval: process.env.TEF_WRITING_USE_LLM_EVAL === 'true',
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
  /** Free tier: maximum notes per account */
  freemiumNotesMax: Number(process.env.FREEMIUM_NOTES_MAX) || 2,
  /** Free tier: lifetime translation requests */
  freemiumTranslationsMax: Number(process.env.FREEMIUM_TRANSLATIONS_MAX) || 500,

  /** Security — comma-separated IPs to block (BLOCKED_IPS=1.2.3.4,5.6.7.8) */
  blockedIps: (process.env.BLOCKED_IPS?.trim() || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
  /** Max requests per IP per minute (global) */
  securityGlobalRateLimit: Number(process.env.SECURITY_GLOBAL_RATE_LIMIT) || 120,
  /** Max auth attempts per IP per window */
  securityAuthRateLimit: Number(process.env.SECURITY_AUTH_RATE_LIMIT) || 15,
  /** Auth rate-limit window (ms) */
  securityAuthWindowMs: Number(process.env.SECURITY_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  /** Failed logins before temporary IP block */
  securityLoginBlockThreshold: Number(process.env.SECURITY_LOGIN_BLOCK_THRESHOLD) || 20,
  /** Temporary IP block duration (ms) */
  securityLoginBlockMs: Number(process.env.SECURITY_LOGIN_BLOCK_MS) || 24 * 60 * 60 * 1000,

  authSecret: process.env.AUTH_SECRET?.trim() || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/auth/callback/google`,
};
