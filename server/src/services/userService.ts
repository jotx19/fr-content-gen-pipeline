// @ts-nocheck
import { User } from '../db/schemas/user.schema.js';
import { TefProfile } from '../db/schemas/tefProfile.schema.js';
import { TefEvaluation } from '../db/schemas/tefEvaluation.schema.js';

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
  locale: string | null;
};

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const now = new Date();
  let user = await User.findOne({ googleId: profile.googleId });

  if (user) {
    user.email = profile.email;
    user.name = profile.name;
    user.picture = profile.picture;
    user.locale = profile.locale;
    user.lastLoginAt = now;
    user.updatedAt = now;
    await user.save();
  } else {
    user = await User.create({
      ...profile,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  const userId = user._id.toString();
  await TefProfile.findOneAndUpdate(
    { userId },
    { $setOnInsert: { createdAt: now, accuracyHistory: [], stats: {} } },
    { upsert: true }
  );

  return user;
}

export async function getUserById(userId: string) {
  return User.findById(userId).lean();
}

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
};

export function toPublicUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    picture: user.picture ?? null,
  };
}

export async function getLatestEvaluation(userId: string) {
  return TefEvaluation.findOne({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getEvaluationHistory(userId: string, limit = 20) {
  return TefEvaluation.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-questions -userAnswers -results')
    .lean();
}
