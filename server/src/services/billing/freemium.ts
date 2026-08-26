import { User, type UserDocument, type UserPlan } from '../../app/db/schemas/user.schema.js';
import { config } from '../../config.js';

export type PaywallFeature = 'reading' | 'writing';

export class PaywallError extends Error {
  code = 'PAYWALL';
  feature: PaywallFeature;
  limit: number;
  used: number;

  constructor(feature: PaywallFeature, limit: number, used: number) {
    super(`Daily ${feature} limit reached`);
    this.feature = feature;
    this.limit = limit;
    this.used = used;
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type ProCheckUser = {
  plan?: UserPlan | string;
  subscriptionStatus?: string;
  currentPeriodEnd?: Date | null;
};

function isAccessExpired(user: { currentPeriodEnd?: Date | null }): boolean {
  if (!user.currentPeriodEnd) return false;
  return new Date() > new Date(user.currentPeriodEnd);
}

export function isProUser(user: ProCheckUser | null | undefined): boolean {
  if (!user) return false;
  if (isAccessExpired(user)) return false;
  if (user.plan === 'pro') return true;
  return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
}

async function loadUser(userId: string): Promise<UserDocument> {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return user;
}

function resetUsageIfNeeded(user: UserDocument): void {
  const key = todayKey();
  if (!user.usage) {
    user.usage = { date: key, readingSessions: 0, writingSessions: 0 };
  }
  if (user.usage.date !== key) {
    user.usage.date = key;
    user.usage.readingSessions = 0;
    user.usage.writingSessions = 0;
  }
}

export type UsageStatus = {
  plan: UserPlan;
  subscriptionStatus: string;
  subscriptionInterval: string | null;
  currentPeriodEnd: string | null;
  limits: {
    readingSessionsPerDay: number | null;
    writingSessionsPerDay: number | null;
  };
  usage: {
    date: string | null | undefined;
    readingSessions: number;
    writingSessions: number;
  };
};

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const user = await loadUser(userId);
  resetUsageIfNeeded(user);

  if (user.plan === 'pro' && isAccessExpired(user)) {
    user.plan = 'free';
    user.subscriptionStatus = 'canceled';
    user.subscriptionInterval = null;
    user.currentPeriodEnd = null;
    user.updatedAt = new Date();
    await user.save();
  }

  const pro = isProUser(user);

  return {
    plan: pro ? 'pro' : 'free',
    subscriptionStatus: user.subscriptionStatus ?? 'none',
    subscriptionInterval: user.subscriptionInterval ?? null,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString?.() ?? null,
    limits: {
      readingSessionsPerDay: pro ? null : config.freemiumReadingPerDay,
      writingSessionsPerDay: pro ? null : config.freemiumWritingPerDay,
    },
    usage: {
      date: user.usage.date,
      readingSessions: user.usage.readingSessions ?? 0,
      writingSessions: user.usage.writingSessions ?? 0,
    },
  };
}

export async function assertFeatureAccess(
  userId: string,
  feature: PaywallFeature
): Promise<UserDocument> {
  const user = await loadUser(userId);
  if (isProUser(user)) return user;

  resetUsageIfNeeded(user);
  const limit =
    feature === 'reading' ? config.freemiumReadingPerDay : config.freemiumWritingPerDay;
  const used =
    feature === 'reading'
      ? (user.usage.readingSessions ?? 0)
      : (user.usage.writingSessions ?? 0);

  if (used >= limit) {
    throw new PaywallError(feature, limit, used);
  }

  return user;
}

export async function consumeFeatureUsage(
  userId: string,
  feature: PaywallFeature
): Promise<void> {
  const user = await loadUser(userId);
  if (isProUser(user)) return;

  resetUsageIfNeeded(user);
  if (feature === 'reading') {
    user.usage.readingSessions = (user.usage.readingSessions ?? 0) + 1;
  } else {
    user.usage.writingSessions = (user.usage.writingSessions ?? 0) + 1;
  }
  user.updatedAt = new Date();
  await user.save();
}
