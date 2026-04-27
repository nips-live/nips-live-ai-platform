import dotenv from 'dotenv';

dotenv.config();

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
};

const list = (name: string, fallback: string[]) =>
  process.env[name]?.split(',').map((item) => item.trim()).filter(Boolean) ?? fallback;

const bool = (name: string, fallback: boolean) => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:4000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8084',
  corsOrigins: list('CORS_ORIGINS', ['http://localhost:8084', 'https://nips.live', 'https://www.nips.live']),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),

  adminEmail: process.env.ADMIN_EMAIL || 'admin@nips.live',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  defaultFreeCredits: Number(process.env.DEFAULT_FREE_CREDITS || 25),
  platformFeeBps: Number(process.env.PLATFORM_FEE_BPS || 335),

  requireEmailActivation: bool('REQUIRE_EMAIL_ACTIVATION', false),
  activationTokenMinutes: Number(process.env.ACTIVATION_TOKEN_MINUTES || 1440),
  resetPasswordTokenMinutes: Number(process.env.RESET_PASSWORD_TOKEN_MINUTES || 60),

  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: bool('SMTP_SECURE', false),
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || 'NIPS.live <no-reply@nips.live>',

  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL || 'https://nips.live/account/billing/success',
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL || 'https://nips.live/account/billing/cancel',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  solanaTreasuryWallet: process.env.SOLANA_TREASURY_WALLET || ''
};
