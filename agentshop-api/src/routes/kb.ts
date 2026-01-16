import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const kbRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /kb/search?q=...
  fastify.get('/kb/search', async (request, reply) => {
    const { q } = request.query as { q?: string };

    if (!q) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'q query parameter is required',
        },
      });
    }

    // Use PostgreSQL full-text search with ILIKE as fallback
    const docs = await prisma.kbDoc.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { body: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
    });

    return docs;
  });
};

export default kbRoutes;
