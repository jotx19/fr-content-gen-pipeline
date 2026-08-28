import mongoose, { type HydratedDocument, type Model } from 'mongoose';

export type UserPlan = 'free' | 'pro';

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing';

export type SubscriptionInterval = 'month' | 'year' | null;

export type UserUsage = {
  date?: string | null;
  readingSessions?: number;
  writingSessions?: number;
  translationsTotal?: number;
};

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
  locale: string | null;
  plan: UserPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionInterval: SubscriptionInterval;
  currentPeriodEnd: Date | null;
  usage: UserUsage;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    picture: { type: String, default: null },
    locale: { type: String, default: null },
    plan: { type: String, enum: ['free', 'pro'], default: 'free', index: true },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'past_due', 'canceled', 'trialing'],
      default: 'none',
    },
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null },
    subscriptionInterval: {
      type: String,
      enum: ['month', 'year', null],
      default: null,
    },
    currentPeriodEnd: { type: Date, default: null },
    usage: {
      date: { type: String, default: null },
      readingSessions: { type: Number, default: 0 },
      writingSessions: { type: Number, default: 0 },
      translationsTotal: { type: Number, default: 0 },
    },
    lastLoginAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'users' }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser> | undefined) ??
  mongoose.model<IUser>('User', userSchema);
