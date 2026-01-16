import { FastifyPluginAsync } from 'fastify';
import { metricsService } from '../services/metrics';

const metricsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /metrics
  fastify.get('/metrics', async () => {
    return metricsService.getMetrics();
  });
};

export default metricsRoutes;
