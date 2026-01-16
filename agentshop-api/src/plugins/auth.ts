import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for health check and metrics
    if (request.url === '/health' || request.url === '/metrics') {
      return;
    }

    const authHeader = request.headers.authorization;
    const apiKey = process.env.API_KEY || 'demo-key';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7);
    if (token !== apiKey) {
      return reply.code(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key',
        },
      });
    }
  });
};

export default fp(authPlugin, {
  name: 'auth-plugin',
});
