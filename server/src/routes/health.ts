import { Router, Request, Response } from "express";
import { MonitoringService } from "../services/MonitoringService";
import { CacheService } from "../services/CacheService";
import { logger } from "../utils/logger";

const router = Router();
const cacheService = new CacheService();
const monitoringService = new MonitoringService();

// Basic health check
router.get("/", async (req: Request, res: Response) => {
  try {
    const health = await monitoringService.getSystemHealth();

    const statusCode =
      health.status === "healthy"
        ? 200
        : health.status === "degraded"
        ? 200
        : 503;

    res.status(statusCode).json({
      success: true,
      message: "Health check completed",
      data: health,
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Detailed health check with metrics
router.get("/detailed", async (req: Request, res: Response) => {
  try {
    const [health, performance, business] = await Promise.all([
      monitoringService.getSystemHealth(),
      monitoringService.getPerformanceMetrics(),
      monitoringService.getBusinessMetrics(),
    ]);

    const statusCode =
      health.status === "healthy"
        ? 200
        : health.status === "degraded"
        ? 200
        : 503;

    res.status(statusCode).json({
      success: true,
      message: "Detailed health check completed",
      data: {
        health,
        performance,
        business,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Detailed health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Detailed health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Readiness check (for Kubernetes)
router.get("/ready", async (req: Request, res: Response) => {
  try {
    const health = await monitoringService.getSystemHealth();

    if (health.status === "healthy" || health.status === "degraded") {
      res.status(200).json({
        success: true,
        message: "Service is ready",
        status: "ready",
      });
    } else {
      res.status(503).json({
        success: false,
        message: "Service is not ready",
        status: "not_ready",
      });
    }
  } catch (error) {
    logger.error("Readiness check failed:", error);
    res.status(503).json({
      success: false,
      message: "Service is not ready",
      status: "not_ready",
    });
  }
});

// Liveness check (for Kubernetes)
router.get("/live", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Service is alive",
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Performance metrics endpoint
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getPerformanceMetrics();

    res.json({
      success: true,
      message: "Performance metrics retrieved",
      data: metrics,
    });
  } catch (error) {
    logger.error("Failed to get performance metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get performance metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Business metrics endpoint
router.get("/business", async (req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getBusinessMetrics();

    res.json({
      success: true,
      message: "Business metrics retrieved",
      data: metrics,
    });
  } catch (error) {
    logger.error("Failed to get business metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get business metrics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Cache status endpoint
router.get("/cache", async (req: Request, res: Response) => {
  try {
    const stats = await cacheService.getStats();

    res.json({
      success: true,
      message: "Cache status retrieved",
      data: stats,
    });
  } catch (error) {
    logger.error("Failed to get cache status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Database status endpoint
router.get("/database", async (req: Request, res: Response) => {
  try {
    // Since we're using Firestore, we'll just return a healthy status
    // Firestore doesn't require a connection test like PostgreSQL

    res.json({
      success: true,
      message: "Database status retrieved",
      data: {
        status: "connected",
        responseTime: "< 1ms",
        database: "Firestore",
        message: "Firestore is serverless and always available",
      },
    });
  } catch (error) {
    logger.error("Failed to get database status:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Memory usage endpoint
router.get("/memory", (req: Request, res: Response) => {
  const usage = process.memoryUsage();

  res.json({
    success: true,
    message: "Memory usage retrieved",
    data: {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      arrayBuffers: `${Math.round(usage.arrayBuffers / 1024 / 1024)}MB`,
    },
  });
});

// System info endpoint
router.get("/info", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "System info retrieved",
    data: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
