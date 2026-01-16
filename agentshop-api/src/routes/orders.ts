import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /orders/:id
  fastify.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
    const { id } = request.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        notes: true,
        shipments: {
          include: {
            events: true,
          },
        },
        returns: true,
      },
    });

    if (!order) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    return order;
  });

  // GET /orders?customer_email=...
  fastify.get('/orders', async (request, reply) => {
    const { customer_email } = request.query as { customer_email?: string };

    if (!customer_email) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'customer_email query parameter is required',
        },
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { email: customer_email },
    });

    if (!customer) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        items: true,
        shipments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  });

  // POST /orders/:id/notes
  fastify.post<{
    Params: { id: string };
    Body: { note: string; visibility: 'internal' | 'public' };
  }>('/orders/:id/notes', async (request, reply) => {
    const { id } = request.params;
    const { note, visibility } = request.body;

    if (!note || !visibility) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'note and visibility are required',
        },
      });
    }

    if (visibility !== 'internal' && visibility !== 'public') {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'visibility must be "internal" or "public"',
        },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    const orderNote = await prisma.orderNote.create({
      data: {
        orderId: id,
        note,
        visibility,
      },
    });

    return orderNote;
  });
};

export default orderRoutes;
