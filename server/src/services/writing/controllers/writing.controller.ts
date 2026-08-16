import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  getWritingPrompt,
  submitWriting,
  getWritingExample,
  getWritingEvaluations,
  getWritingProfile,
  setWritingLevelManually,
} from '../methods/writing.methods.js';
import type { SubmitWritingBody, WritingExampleBody } from '../schemas/writing.schema.js';

type AuthedRequest = FastifyRequest & { userId: string };

function mapError(reply: FastifyReply, err: unknown) {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status =
    message.includes('placement') ||
    message.includes('required') ||
    message.includes('prompt') ||
    message.includes('Invalid') ||
    message.includes('Complete reading')
      ? 400
      : 500;
  return reply.status(status).send({ error: message });
}

export async function profile(req: AuthedRequest, reply: FastifyReply) {
  try {
    const data = await getWritingProfile(req.userId);
    if (!data) return reply.status(404).send({ error: 'Profile not found — complete placement first' });
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function prompt(req: AuthedRequest, reply: FastifyReply) {
  try {
    const query = req.query as { topic?: string; section?: 'A' | 'B'; refresh?: boolean };
    const data = await getWritingPrompt(req.userId, query);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function submit(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as SubmitWritingBody;
    const data = await submitWriting(req.userId, body);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function example(req: AuthedRequest, reply: FastifyReply) {
  try {
    const _body = req.body as WritingExampleBody | undefined;
    const data = await getWritingExample(req.userId);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function evaluations(req: AuthedRequest, reply: FastifyReply) {
  try {
    const limit = Number((req.query as { limit?: number }).limit) || 20;
    const data = await getWritingEvaluations(req.userId, limit);
    return reply.send({ evaluations: data });
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function levelSelfSelect(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as { level: string };
    const data = await setWritingLevelManually(req.userId, body.level);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}
