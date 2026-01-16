import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../services/prisma';

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = getPrismaClient();

  // GET /inventory/:sku
  fastify.get<{ Params: { sku: string } }>('/inventory/:sku', async (request, reply) => {
    const { sku } = request.params;

    const inventory = await prisma.inventory.findUnique({
      where: { sku },
      include: {
        reservations: {
          where: {
            releasedAt: null,
          },
        },
      },
    });

    if (!inventory) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Inventory item not found',
        },
      });
    }

    return inventory;
  });

  // POST /inventory/reserve
  fastify.post<{
    Body: { sku: string; qty: number; reason: string };
  }>('/inventory/reserve', async (request, reply) => {
    const { sku, qty, reason } = request.body;

    if (!sku || !qty || !reason) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'sku, qty, and reason are required',
        },
      });
    }

    if (qty <= 0) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'qty must be greater than 0',
        },
      });
    }

    const inventory = await prisma.inventory.findUnique({
      where: { sku },
    });

    if (!inventory) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Inventory item not found',
        },
      });
    }

    if (inventory.availableQty < qty) {
      return reply.code(400).send({
        error: {
          code: 'INSUFFICIENT_INVENTORY',
          message: `Only ${inventory.availableQty} units available`,
        },
      });
    }

    // Use transaction to ensure atomicity
    const [updatedInventory, reservation] = await prisma.$transaction([
      prisma.inventory.update({
        where: { sku },
        data: {
          availableQty: { decrement: qty },
          reservedQty: { increment: qty },
        },
      }),
      prisma.inventoryReservation.create({
        data: {
          sku,
          qty,
          reason,
        },
      }),
    ]);

    return {
      inventory: updatedInventory,
      reservation,
    };
  });

  // POST /inventory/release
  fastify.post<{
    Body: { reservation_id: string };
  }>('/inventory/release', async (request, reply) => {
    const { reservation_id } = request.body;

    if (!reservation_id) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'reservation_id is required',
        },
      });
    }

    const reservation = await prisma.inventoryReservation.findUnique({
      where: { id: reservation_id },
    });

    if (!reservation) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Reservation not found',
        },
      });
    }

    if (reservation.releasedAt) {
      return reply.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Reservation already released',
        },
      });
    }

    // Use transaction to ensure atomicity
    const [updatedInventory, releasedReservation] = await prisma.$transaction([
      prisma.inventory.update({
        where: { sku: reservation.sku },
        data: {
          availableQty: { increment: reservation.qty },
          reservedQty: { decrement: reservation.qty },
        },
      }),
      prisma.inventoryReservation.update({
        where: { id: reservation_id },
        data: {
          releasedAt: new Date(),
        },
      }),
    ]);

    return {
      inventory: updatedInventory,
      reservation: releasedReservation,
    };
  });
};

export default inventoryRoutes;
