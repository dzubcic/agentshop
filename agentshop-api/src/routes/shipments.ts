import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const shipmentRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /shipments/by-tracking/:tracking_id
  fastify.get<{ Params: { tracking_id: string } }>(
    '/shipments/by-tracking/:tracking_id',
    async (request, reply) => {
      const { tracking_id } = request.params;

      const shipment = await prisma.shipment.findUnique({
        where: { trackingId: tracking_id },
        include: {
          events: {
            orderBy: {
              eventTime: 'desc',
            },
          },
          order: {
            include: {
              customer: true,
              items: true,
            },
          },
        },
      });

      if (!shipment) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Shipment not found',
          },
        });
      }

      return shipment;
    }
  );

  // GET /shipments/by-order/:order_id
  fastify.get<{ Params: { order_id: string } }>(
    '/shipments/by-order/:order_id',
    async (request, reply) => {
      const { order_id } = request.params;

      const shipments = await prisma.shipment.findMany({
        where: { orderId: order_id },
        include: {
          events: {
            orderBy: {
              eventTime: 'desc',
            },
          },
        },
      });

      if (shipments.length === 0) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'No shipments found for this order',
          },
        });
      }

      return shipments;
    }
  );

  // POST /shipments/:id/simulate
  fastify.post<{
    Params: { id: string };
    Body: { status: string; message: string; location?: string };
  }>('/shipments/:id/simulate', async (request, reply) => {
    const { id } = request.params;
    const { status, message, location } = request.body;

    if (!status || !message) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'status and message are required',
        },
      });
    }

    const validStatuses = [
      'label_created',
      'in_transit',
      'delayed',
      'out_for_delivery',
      'delivered',
      'exception',
    ];

    if (!validStatuses.includes(status)) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!shipment) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found',
        },
      });
    }

    // Update shipment status and create event
    const [updatedShipment, event] = await prisma.$transaction([
      prisma.shipment.update({
        where: { id },
        data: {
          status: status as 'label_created' | 'in_transit' | 'delayed' | 'out_for_delivery' | 'delivered' | 'exception',
          lastUpdateAt: new Date(),
        },
      }),
      prisma.shipmentEvent.create({
        data: {
          shipmentId: id,
          eventTime: new Date(),
          location: location || null,
          status,
          message,
        },
      }),
    ]);

    return {
      shipment: updatedShipment,
      event,
    };
  });
};

export default shipmentRoutes;
