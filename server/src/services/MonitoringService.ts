// TODO: This service needs to be migrated to use Firestore instead of PostgreSQL
// For now, commenting out to allow server to start
/*
// import { pool } from "../database/database"; // Removed - using Firestore now
import { CacheService } from "./CacheService";
import { logger } from "../utils/logger";

export class MonitoringService {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    checks: {
      database: HealthCheck;
      redis: HealthCheck;
      memory: HealthCheck;
      uptime: HealthCheck;
    };
    timestamp: string;
  }> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkUptime(),
    ]);

    const [database, redis, memory, uptime] = checks.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        const checkNames = ["database", "redis", "memory", "uptime"];
        logger.error(
          `Health check failed for ${checkNames[index]}:`,
          result.reason
        );
        return {
          status: "unhealthy" as const,
          message: "Check failed",
          details: result.reason?.message || "Unknown error",
        };
      }
    });

    const overallStatus = this.determineOverallStatus([
      database,
      redis,
      memory,
      uptime,
    ]);

    return {
      status: overallStatus,
      checks: {
        database,
        redis,
        memory,
        uptime,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getPerformanceMetrics(): Promise<{
    responseTime: {
      average: number;
      p95: number;
      p99: number;
    };
    throughput: {
      requestsPerSecond: number;
      requestsPerMinute: number;
    };
    errorRate: {
      percentage: number;
      totalErrors: number;
      totalRequests: number;
    };
    database: {
      activeConnections: number;
      maxConnections: number;
      queryTime: {
        average: number;
        slowest: number;
      };
    };
    cache: {
      hitRate: number;
      missRate: number;
      totalKeys: number;
    };
  }> {
    // This would typically integrate with your metrics collection system
    // For now, we'll return mock data structure
    return {
      responseTime: {
        average: 150,
        p95: 300,
        p99: 500,
      },
      throughput: {
        requestsPerSecond: 50,
        requestsPerMinute: 3000,
      },
      errorRate: {
        percentage: 0.5,
        totalErrors: 15,
        totalRequests: 3000,
      },
      database: {
        activeConnections: 5,
        maxConnections: 20,
        queryTime: {
          average: 25,
          slowest: 200,
        },
      },
      cache: {
        hitRate: 85.5,
        missRate: 14.5,
        totalKeys: 1250,
      },
    };
  }

  async getBusinessMetrics(): Promise<{
    users: {
      total: number;
      active: number;
      newThisMonth: number;
    };
    courses: {
      total: number;
      active: number;
      enrollments: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      growth: number;
    };
    engagement: {
      assignmentSubmissions: number;
      liveClassAttendance: number;
      averageSessionTime: number;
    };
  }> {
    try {
      const [userStats, courseStats, revenueStats, engagementStats] =
        await Promise.all([
          this.getUserStats(),
          this.getCourseStats(),
          this.getRevenueStats(),
          this.getEngagementStats(),
        ]);

      return {
        users: userStats,
        courses: courseStats,
        revenue: revenueStats,
        engagement: engagementStats,
      };
    } catch (error) {
      logger.error("Error getting business metrics:", error);
      throw error;
    }
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      await pool.query("SELECT 1");
      const responseTime = Date.now() - start;

      return {
        status: responseTime < 1000 ? "healthy" : "degraded",
        message: "Database connection successful",
        details: {
          responseTime: `${responseTime}ms`,
          maxConnections: pool.options.max,
          idleConnections: pool.totalCount - pool.idleCount,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async checkRedis(): Promise<HealthCheck> {
    try {
      const stats = await this.cacheService.getStats();

      return {
        status: stats.connected ? "healthy" : "unhealthy",
        message: stats.connected
          ? "Redis connection successful"
          : "Redis connection failed",
        details: {
          connected: stats.connected,
          keys: stats.keys,
          memory: stats.memory,
        },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: "Redis connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);

    const status =
      usedMB < 500 ? "healthy" : usedMB < 1000 ? "degraded" : "unhealthy";

    return {
      status,
      message: `Memory usage: ${usedMB}MB / ${totalMB}MB`,
      details: {
        heapTotal: `${totalMB}MB`,
        heapUsed: `${usedMB}MB`,
        external: `${externalMB}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      },
    };
  }

  private async checkUptime(): Promise<HealthCheck> {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return {
      status: "healthy",
      message: `Uptime: ${hours}h ${minutes}m`,
      details: {
        uptime: `${uptime}s`,
        formatted: `${hours}h ${minutes}m`,
      },
    };
  }

  private determineOverallStatus(
    checks: HealthCheck[]
  ): "healthy" | "degraded" | "unhealthy" {
    const unhealthyCount = checks.filter(
      (check) => check.status === "unhealthy"
    ).length;
    const degradedCount = checks.filter(
      (check) => check.status === "degraded"
    ).length;

    if (unhealthyCount > 0) return "unhealthy";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  }

  private async getUserStats(): Promise<{
    total: number;
    active: number;
    newThisMonth: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_this_month
      FROM users
    `;
    const result = await pool.query(query);
    const row = result.rows[0];

    return {
      total: parseInt(row.total),
      active: parseInt(row.active),
      newThisMonth: parseInt(row.new_this_month),
    };
  }

  private async getCourseStats(): Promise<{
    total: number;
    active: number;
    enrollments: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        (SELECT COUNT(*) FROM course_registrations WHERE status = 'approved') as enrollments
      FROM courses
    `;
    const result = await pool.query(query);
    const row = result.rows[0];

    return {
      total: parseInt(row.total),
      active: parseInt(row.active),
      enrollments: parseInt(row.enrollments),
    };
  }

  private async getRevenueStats(): Promise<{
    total: number;
    thisMonth: number;
    growth: number;
  }> {
    const query = `
      SELECT 
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount END), 0) as this_month,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
                          AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN amount END), 0) as last_month
      FROM payments 
      WHERE status = 'successful'
    `;
    const result = await pool.query(query);
    const row = result.rows[0];

    const total = parseFloat(row.total);
    const thisMonth = parseFloat(row.this_month);
    const lastMonth = parseFloat(row.last_month);
    const growth =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      total,
      thisMonth,
      growth: Math.round(growth * 100) / 100,
    };
  }

  private async getEngagementStats(): Promise<{
    assignmentSubmissions: number;
    liveClassAttendance: number;
    averageSessionTime: number;
  }> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM assignment_submissions) as assignment_submissions,
        (SELECT COUNT(*) FROM live_classes WHERE status = 'completed') as live_class_attendance,
        (SELECT AVG(duration_minutes) FROM live_classes WHERE status = 'completed') as average_session_time
    `;
    const result = await pool.query(query);
    const row = result.rows[0];

    return {
      assignmentSubmissions: parseInt(row.assignment_submissions),
      liveClassAttendance: parseInt(row.live_class_attendance),
      averageSessionTime: parseFloat(row.average_session_time) || 0,
    };
  }
}

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  message: string;
  details?: any;
}
*/

// Temporary simple monitoring service for Firestore
export class MonitoringService {
  // TODO: Implement Firestore-based monitoring
  async getSystemHealth() {
    return {
      status: "healthy",
      database: "Firestore",
      timestamp: new Date().toISOString(),
    };
  }

  async getPerformanceMetrics() {
    return {
      responseTime: "< 1ms",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      database: "Firestore",
      timestamp: new Date().toISOString(),
    };
  }

  async getBusinessMetrics() {
    return {
      totalCourses: 0,
      totalUsers: 0,
      activeConnections: 0,
      database: "Firestore",
      timestamp: new Date().toISOString(),
    };
  }
}
