import { FastifyPluginAsync } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const demoRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /demo/reset
  // Note: This endpoint executes a shell command to run the seed script.
  // This is intentional for demo purposes and should only be used in development/demo environments.
  // In production, this endpoint should be removed or protected with additional authorization.
  fastify.post('/demo/reset', async (_request, reply) => {
    try {
      // Run seed script - this is a fixed command for demo reset purposes
      await execAsync('npx tsx prisma/seed.ts', {
        cwd: process.cwd(),
      });

      return {
        message: 'Database reset to seed state',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset database',
        },
      });
    }
  });
};

export default demoRoutes;
