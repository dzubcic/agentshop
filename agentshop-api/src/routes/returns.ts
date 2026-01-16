import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const returnRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // POST /returns
  fastify.post<{
    Body: { order_id: string; reason_code: string; details?: string };
  }>('/returns', async (request, reply) => {
    const { order_id, reason_code, details } = request.body;

    if (!order_id || !reason_code) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'order_id and reason_code are required',
        },
      });
    }

    const validReasonCodes = ['wrong_item', 'damaged', 'late', 'changed_mind'];
    if (!validReasonCodes.includes(reason_code)) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid reason_code. Must be one of: ${validReasonCodes.join(', ')}`,
        },
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    const returnRequest = await prisma.return.create({
      data: {
        orderId: order_id,
        reasonCode: reason_code as 'wrong_item' | 'damaged' | 'late' | 'changed_mind',
        details: details || null,
        status: 'requested',
      },
    });

    return returnRequest;
  });

  // POST /returns/:id/approve
  fastify.post<{ Params: { id: string } }>('/returns/:id/approve', async (request, reply) => {
    const { id } = request.params;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Return not found',
        },
      });
    }

    if (returnRequest.status !== 'requested') {
      return reply.code(400).send({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot approve return with status: ${returnRequest.status}`,
        },
      });
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        status: 'approved',
      },
    });

    return updatedReturn;
  });

  // POST /returns/:id/receive
  fastify.post<{ Params: { id: string } }>('/returns/:id/receive', async (request, reply) => {
    const { id } = request.params;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Return not found',
        },
      });
    }

    if (returnRequest.status !== 'approved' && returnRequest.status !== 'requested') {
      return reply.code(400).send({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot receive return with status: ${returnRequest.status}`,
        },
      });
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        status: 'received',
      },
    });

    return updatedReturn;
  });

  // POST /returns/:id/refund
  fastify.post<{ Params: { id: string } }>('/returns/:id/refund', async (request, reply) => {
    const { id } = request.params;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Return not found',
        },
      });
    }

    if (returnRequest.status !== 'approved' && returnRequest.status !== 'received') {
      return reply.code(400).send({
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot refund return with status: ${returnRequest.status}. Must be approved or received.`,
        },
      });
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        status: 'refunded',
        resolvedAt: new Date(),
      },
    });

    return updatedReturn;
  });
};

export default returnRoutes;
