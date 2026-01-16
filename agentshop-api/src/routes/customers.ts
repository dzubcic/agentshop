import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const customerRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /customers?email=...
  fastify.get('/customers', async (request, reply) => {
    const { email } = request.query as { email?: string };

    if (!email) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Email query parameter is required',
        },
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      });
    }

    return customer;
  });

  // GET /customers/:id
  fastify.get<{ Params: { id: string } }>('/customers/:id', async (request, reply) => {
    const { id } = request.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      });
    }

    return customer;
  });
};

export default customerRoutes;
