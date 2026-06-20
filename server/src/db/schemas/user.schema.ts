// @ts-nocheck
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    picture: { type: String, default: null },
    locale: { type: String, default: null },
    lastLoginAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'users' }
);
export const User =
  mongoose.models.User ?? mongoose.model('User', userSchema);
