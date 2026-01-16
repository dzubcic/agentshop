import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

const requestIdPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    request.requestId = requestId;
    reply.header('X-Request-Id', requestId);
    
    // Add requestId to logger
    request.log = request.log.child({ requestId });
  });
};

export default fp(requestIdPlugin, {
  name: 'request-id-plugin',
});
