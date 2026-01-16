import { FastifyPluginAsync } from 'fastify';
import { TicketPriority, TicketType } from '@prisma/client';
import { getPrismaClient } from '../services/prisma';

const ticketRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // POST /tickets
  fastify.post<{
    Body: { type: TicketType; priority: TicketPriority; title: string; body: string };
  }>('/tickets', async (request, reply) => {
    const { type, priority, title, body } = request.body;

    if (!type || !priority || !title || !body) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'type, priority, title, and body are required',
        },
      });
    }

    const validTypes = Object.values(TicketType);
    const validPriorities = Object.values(TicketPriority);

    if (!validTypes.includes(type)) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        },
      });
    }

    if (!validPriorities.includes(priority)) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        },
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        type,
        priority,
        title,
        body,
      },
    });

    return ticket;
  });

  // GET /tickets/:id
  fastify.get<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const { id } = request.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        },
      });
    }

    return ticket;
  });
};

export default ticketRoutes;
