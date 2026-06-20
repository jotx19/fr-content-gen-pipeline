// @ts-nocheck
import mongoose from 'mongoose';

const skillBreakdownItemSchema = new mongoose.Schema(
  {
    skillTag: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true },
  },
  { _id: false }
);

const questionResultSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    correct: { type: Boolean, required: true },
    skillTag: { type: String, default: '' },
    explanation: { type: String, default: undefined },
  },
  { _id: false }
);

const tefEvaluationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    kind: { type: String, enum: ['placement', 'practice'], required: true },
    overallAccuracy: { type: Number, required: true },
    skillBreakdown: { type: [skillBreakdownItemSchema], default: [] },
    weakAreas: { type: [String], default: [] },
    userAnswers: { type: [Number], required: true },
    results: { type: [questionResultSchema], default: [] },
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    levelBefore: { type: String, default: null },
    levelAfter: { type: String, default: null },
    adjustment: { type: String, enum: ['levelUp', 'levelDown', 'same', null], default: null },
    reason: { type: String, default: null },
    confidence: { type: Number, default: null },
    summary: { type: String, default: '' },
    topic: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: 'tef_evaluations' }
);

tefEvaluationSchema.index({ userId: 1, createdAt: -1 });
export const TefEvaluation =
  mongoose.models.TefEvaluation ?? mongoose.model('TefEvaluation', tefEvaluationSchema);
