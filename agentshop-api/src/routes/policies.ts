import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const policyRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /policies?country=...
  fastify.get('/policies', async (request, reply) => {
    const { country } = request.query as { country?: string };

    if (!country) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'country query parameter is required',
        },
      });
    }

    const policy = await prisma.policy.findUnique({
      where: { countryCode: country.toUpperCase() },
    });

    if (!policy) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Policy not found for this country',
        },
      });
    }

    return policy;
  });
};

export default policyRoutes;
