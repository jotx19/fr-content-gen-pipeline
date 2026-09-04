import { Note } from '../../app/db/mongo.js';
import { User, type UserDocument, type UserPlan } from '../../app/db/schemas/user.schema.js';
import { config } from '../../config.js';

export type PaywallFeature = 'reading' | 'writing' | 'notes' | 'translate';

const FEATURE_LABELS: Record<PaywallFeature, string> = {
  reading: 'Daily reading limit reached',
  writing: 'Daily writing limit reached',
  notes: 'Notes limit reached',
  translate: 'Translation limit reached',
};

export class PaywallError extends Error {
  code = 'PAYWALL';
  feature: PaywallFeature;
  limit: number;
  used: number;

  constructor(feature: PaywallFeature, limit: number, used: number) {
    super(FEATURE_LABELS[feature]);
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

/** Persist free tier when a one-time or subscription period has ended. */
export async function downgradeExpiredUserIfNeeded(user: UserDocument): Promise<UserDocument> {
  if (user.plan === 'pro' && isAccessExpired(user)) {
    user.plan = 'free';
    user.subscriptionStatus = 'canceled';
    user.subscriptionInterval = null;
    user.currentPeriodEnd = null;
    user.updatedAt = new Date();
    await user.save();
  }
  return user;
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
    user.usage = { date: key, readingSessions: 0, writingSessions: 0, translationsTotal: 0 };
  }
  if (user.usage.date !== key) {
    user.usage.date = key;
    user.usage.readingSessions = 0;
    user.usage.writingSessions = 0;
  }
  if (user.usage.translationsTotal == null) {
    user.usage.translationsTotal = 0;
  }
}

export type UsageStatus = {
  plan: UserPlan;
  subscriptionStatus: string;
  subscriptionInterval: string | null;
  currentPeriodEnd: string | null;
  isPro: boolean;
  isTrial: boolean;
  showPlanBadge: boolean;
  limits: {
    readingSessionsPerDay: number | null;
    writingSessionsPerDay: number | null;
    notesMax: number | null;
    translationsMax: number | null;
  };
  usage: {
    date: string | null | undefined;
    readingSessions: number;
    writingSessions: number;
    notesCount: number;
    translationsTotal: number;
  };
};

export async function getNotesCount(userId: string): Promise<number> {
  return Note.countDocuments({ userId });
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  let user = await loadUser(userId);
  resetUsageIfNeeded(user);
  user = await downgradeExpiredUserIfNeeded(user);

  const pro = isProUser(user);
  const isTrial = pro && user.subscriptionStatus === 'trialing';
  const notesCount = await getNotesCount(userId);

  return {
    plan: pro ? 'pro' : 'free',
    subscriptionStatus: user.subscriptionStatus ?? 'none',
    subscriptionInterval: user.subscriptionInterval ?? null,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString?.() ?? null,
    isPro: pro && !isTrial,
    isTrial,
    showPlanBadge: pro,
    limits: {
      readingSessionsPerDay: pro ? null : config.freemiumReadingPerDay,
      writingSessionsPerDay: pro ? null : config.freemiumWritingPerDay,
      notesMax: pro ? null : config.freemiumNotesMax,
      translationsMax: pro ? null : config.freemiumTranslationsMax,
    },
    usage: {
      date: user.usage.date,
      readingSessions: user.usage.readingSessions ?? 0,
      writingSessions: user.usage.writingSessions ?? 0,
      notesCount,
      translationsTotal: user.usage.translationsTotal ?? 0,
    },
  };
}

export async function assertFeatureAccess(
  userId: string,
  feature: PaywallFeature
): Promise<UserDocument> {
  let user = await loadUser(userId);
  user = await downgradeExpiredUserIfNeeded(user);
  if (isProUser(user)) return user;

  resetUsageIfNeeded(user);

  if (feature === 'notes') {
    const used = await getNotesCount(userId);
    const limit = config.freemiumNotesMax;
    if (used >= limit) {
      throw new PaywallError(feature, limit, used);
    }
    return user;
  }

  if (feature === 'translate') {
    const limit = config.freemiumTranslationsMax;
    const used = user.usage.translationsTotal ?? 0;
    if (used >= limit) {
      throw new PaywallError(feature, limit, used);
    }
    return user;
  }

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
  let user = await loadUser(userId);
  user = await downgradeExpiredUserIfNeeded(user);
  if (isProUser(user)) return;

  resetUsageIfNeeded(user);
  if (feature === 'reading') {
    user.usage.readingSessions = (user.usage.readingSessions ?? 0) + 1;
  } else if (feature === 'writing') {
    user.usage.writingSessions = (user.usage.writingSessions ?? 0) + 1;
  } else if (feature === 'translate') {
    user.usage.translationsTotal = (user.usage.translationsTotal ?? 0) + 1;
  }
  user.updatedAt = new Date();
  await user.save();
}
