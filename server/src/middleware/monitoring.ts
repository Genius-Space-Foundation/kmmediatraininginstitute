import { Request, Response, NextFunction } from "express";
import {
  trackRequest,
  trackPerformance,
  trackError,
} from "../utils/advancedLogger";
import { performance } from "perf_hooks";

// Request timing middleware
export const requestTiming = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = performance.now();

  res.on("finish", () => {
    const duration = Math.round(performance.now() - startTime);
    const userAgent = req.get("User-Agent");

    trackRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      userAgent
    );

    // Track slow requests
    if (duration > 1000) {
      trackPerformance("slow_request", duration, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// Error tracking middleware
export const errorTracking = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  trackError(error, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  next(error);
};

// Database query performance tracking
export const trackDatabaseQuery = (
  query: string,
  duration: number,
  params?: any
) => {
  if (duration > 100) {
    // Track queries slower than 100ms
    trackPerformance("slow_database_query", duration, {
      query: query.substring(0, 200), // Truncate long queries
      params: params ? JSON.stringify(params).substring(0, 100) : undefined,
    });
  }
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  trackPerformance("memory_usage", 0, {
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
  });
};

// CPU usage monitoring
export const trackCPUUsage = () => {
  const cpuUsage = process.cpuUsage();
  trackPerformance("cpu_usage", 0, {
    user: cpuUsage.user,
    system: cpuUsage.system,
  });
};
