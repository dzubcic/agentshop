class MetricsService {
  private startTime: number;
  private requestCount: number;

  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }

  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsageMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

    return {
      uptime_seconds: uptimeSeconds,
      requests_total: this.requestCount,
      memory_usage_mb: memoryUsageMb,
      timestamp: new Date().toISOString(),
    };
  }
}

export const metricsService = new MetricsService();
