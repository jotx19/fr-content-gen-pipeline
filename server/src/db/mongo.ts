// @ts-nocheck
import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export { User } from './schemas/user.schema.js';
export { TefProfile, TefUser } from './schemas/tefProfile.schema.js';
export { TefEvaluation } from './schemas/tefEvaluation.schema.js';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[mongo] MONGODB_URI not set — TEF requires MongoDB');
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getMongoStatus() {
  if (!process.env.MONGODB_URI) {
    return { configured: false, connected: false, state: 'not_configured' };
  }
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    configured: true,
    connected: state === 1,
    state: states[state] ?? 'unknown',
  };
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}
