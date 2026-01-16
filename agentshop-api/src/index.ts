import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import { closePrismaClient } from './services/prisma';
import { metricsService } from './services/metrics';

// Load environment variables
config();

// Import plugins
import requestIdPlugin from './plugins/requestId';
import authPlugin from './plugins/auth';

// Import routes
import customerRoutes from './routes/customers';
import orderRoutes from './routes/orders';
import shipmentRoutes from './routes/shipments';
import inventoryRoutes from './routes/inventory';
import returnRoutes from './routes/returns';
import ticketRoutes from './routes/tickets';
import policyRoutes from './routes/policies';
import kbRoutes from './routes/kb';
import demoRoutes from './routes/demo';
import metricsRoutes from './routes/metrics';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const fastify = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Register plugins
    await fastify.register(requestIdPlugin);
    await fastify.register(authPlugin);

    // Add metrics tracking hook
    fastify.addHook('onResponse', async () => {
      metricsService.incrementRequestCount();
    });

    // Health check endpoint (no auth required)
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(customerRoutes);
    await fastify.register(orderRoutes);
    await fastify.register(shipmentRoutes);
    await fastify.register(inventoryRoutes);
    await fastify.register(returnRoutes);
    await fastify.register(ticketRoutes);
    await fastify.register(policyRoutes);
    await fastify.register(kbRoutes);
    await fastify.register(demoRoutes);
    await fastify.register(metricsRoutes);

    // Global error handler
    fastify.setErrorHandler((error, _request, reply) => {
      fastify.log.error(error);
      reply.code(error.statusCode || 500).send({
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    });

    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    await closePrismaClient();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
