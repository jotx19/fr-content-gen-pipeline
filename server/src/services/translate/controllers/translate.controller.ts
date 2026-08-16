import type { FastifyRequest, FastifyReply } from 'fastify';
import { translateText } from '../methods/translate.methods.js';
import type { TranslateBody } from '../schemas/translate.schema.js';

type AuthedRequest = FastifyRequest & { userId: string; body: TranslateBody };

export async function translate(req: AuthedRequest, reply: FastifyReply) {
  try {
    const data = await translateText(req.body);
    return reply.send(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Translation failed';
    const status =
      message.includes('not configured') ||
      message.includes('authentication') ||
      message.includes('quota')
        ? 503
        : 400;
    return reply.status(status).send({ error: message });
  }
}
