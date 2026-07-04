import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  appName: process.env.APP_NAME || 'TEF Canada Coach',
  tefPlacementCount: Number(process.env.TEF_PLACEMENT_COUNT) || 5,
  tefPracticeCount: Number(process.env.TEF_PRACTICE_COUNT) || 3,
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
  authSecret: process.env.AUTH_SECRET?.trim() || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    `${process.env.CLIENT_URL || 'http://localhost:3000'}/api/auth/callback/google`,
};
