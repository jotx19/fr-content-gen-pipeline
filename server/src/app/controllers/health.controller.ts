import type { FastifyRequest, FastifyReply } from 'fastify';
import { connectDB, getMongoStatus } from '../db/mongo.js';
import { probeQdrant } from '../db/qdrant.js';
import { listSubagents, loadSubagents } from '../../content-pipeline/agent/subagent_registry.js';

export async function health(_req: FastifyRequest, reply: FastifyReply) {
  await connectDB().catch(() => {});
  loadSubagents();
  const qdrant = await probeQdrant();
  return reply.send({
    status: 'ok',
    service: 'tef-agent',
    runtime: 'fastify',
    timestamp: new Date().toISOString(),
    mongodb: getMongoStatus(),
    qdrant,
    subagents: listSubagents(),
  });
}
