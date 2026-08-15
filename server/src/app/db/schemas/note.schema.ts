// @ts-nocheck
import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled', trim: true },
    /** BlockNote / TipTap JSON document */
    content: { type: mongoose.Schema.Types.Mixed, default: null },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
      index: true,
    },
    /** Optional plain-text excerpt for list cards */
    excerpt: { type: String, default: '' },
  },
  {
    collection: 'notes',
    timestamps: true,
  }
);

noteSchema.index({ userId: 1, updatedAt: -1 });

export const Note = mongoose.models.Note ?? mongoose.model('Note', noteSchema);
