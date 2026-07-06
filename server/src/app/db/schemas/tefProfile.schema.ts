// @ts-nocheck
import mongoose from 'mongoose';

const tefProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    level: { type: String, default: null },
    writingLevel: { type: String, default: null },
    confidence: { type: Number, default: null },
    weakAreas: { type: [String], default: [] },
    summary: { type: String, default: '' },
    accuracyHistory: { type: [Number], default: [] },
    pendingPlacement: { type: mongoose.Schema.Types.Mixed, default: null },
    pendingPractice: { type: mongoose.Schema.Types.Mixed, default: null },
    pendingWriting: { type: mongoose.Schema.Types.Mixed, default: null },
    writingScoreHistory: { type: [Number], default: [] },
    lastEvaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'TefEvaluation', default: null },
    stats: {
      totalSessions: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      xp: { type: Number, default: 0 },
      readingXp: { type: Number, default: 0 },
      writingXp: { type: Number, default: 0 },
    },
    onboardedAt: { type: Date, default: null },
    onboardMethod: { type: String, enum: ['placement', 'self_selected'], default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'tef_profiles' }
);
export const TefProfile =
  mongoose.models.TefProfile ?? mongoose.model('TefProfile', tefProfileSchema);

/** @deprecated Use TefProfile — kept for migration reference */
export const TefUser = TefProfile;
