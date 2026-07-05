import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  getUserProfile,
  getUserEvaluations,
  startOnboard,
  submitOnboard,
  onRequestPractice,
  onSubmitAnswers,
  prefetchPractice,
  checkSessionAnswer,
} from '../methods/reading.methods.js';
import type { SubmitAnswersBody, CheckAnswerBody } from '../schemas/reading.schema.js';
import type { TefModule } from '../../../app/db/schemas/tefEvaluation.schema.js';

type AuthedRequest = FastifyRequest & { userId: string };

function mapError(reply: FastifyReply, err: unknown) {
  const message = err instanceof Error ? err.message : 'Internal server error';
  const status =
    message.includes('placement') ||
    message.includes('required') ||
    message.includes('Complete placement')
      ? 400
      : 500;
  return reply.status(status).send({ error: message });
}

export async function profile(req: AuthedRequest, reply: FastifyReply) {
  try {
    const profile = await getUserProfile(req.userId);
    if (!profile) return reply.status(404).send({ error: 'Profile not found' });
    return reply.send(profile);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function evaluations(req: AuthedRequest, reply: FastifyReply) {
  try {
    const query = req.query as { limit?: number; module?: TefModule };
    const limit = Number(query.limit) || 20;
    const data = await getUserEvaluations(req.userId, limit, query.module);
    return reply.send({ evaluations: data });
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function onboardStart(req: AuthedRequest, reply: FastifyReply) {
  try {
    const data = await startOnboard(req.userId);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function onboardSubmit(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as SubmitAnswersBody;
    const data = await submitOnboard(req.userId, body.userAnswers);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function practiceGet(req: AuthedRequest, reply: FastifyReply) {
  try {
    const data = await onRequestPractice(req.userId);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function practiceSubmit(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as SubmitAnswersBody;
    const data = await onSubmitAnswers(req.userId, body.userAnswers);
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function practicePrefetch(req: AuthedRequest, reply: FastifyReply) {
  try {
    const result = await prefetchPractice(req.userId);
    return reply.send(result);
  } catch (err) {
    return mapError(reply, err);
  }
}

export async function checkAnswer(req: AuthedRequest, reply: FastifyReply) {
  try {
    const body = req.body as CheckAnswerBody;
    const data = await checkSessionAnswer(
      req.userId,
      body.kind,
      body.questionIndex,
      body.userAnswer
    );
    return reply.send(data);
  } catch (err) {
    return mapError(reply, err);
  }
}
