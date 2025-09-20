import Redis from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";

export class CacheService {
  private redis: Redis | null = null;
  private isRedisAvailable: boolean = false;

  constructor() {
    try {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        enableReadyCheck: false,
        maxRetriesPerRequest: 0, // Don't retry on connection failure
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000,
      });

      this.redis.on("connect", () => {
        logger.info("Redis connected successfully");
        this.isRedisAvailable = true;
      });

      this.redis.on("error", (error) => {
        logger.warn(
          "Redis connection error (caching disabled):",
          error.message
        );
        this.isRedisAvailable = false;
      });

      this.redis.on("close", () => {
        logger.warn("Redis connection closed (caching disabled)");
        this.isRedisAvailable = false;
      });
    } catch (error) {
      logger.warn("Failed to initialize Redis (caching disabled):", error);
      this.isRedisAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisAvailable || !this.redis) {
      return null;
    }
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    if (!this.isRedisAvailable || !this.redis) {
      return;
    }
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isRedisAvailable || !this.redis) {
      return;
    }
    try {
      await this.redis.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    if (!this.isRedisAvailable || !this.redis) {
      return;
    }
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(
          `Cache invalidated for pattern: ${pattern} (${keys.length} keys)`
        );
      }
    } catch (error) {
      logger.error(`Error invalidating cache pattern ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isRedisAvailable || !this.redis) {
      return false;
    }
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking cache key existence ${key}:`, error);
      return false;
    }
  }

  async getTTL(key: string): Promise<number> {
    if (!this.isRedisAvailable || !this.redis) {
      return -1;
    }
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async flushAll(): Promise<void> {
    if (!this.isRedisAvailable || !this.redis) {
      return;
    }
    try {
      await this.redis.flushall();
      logger.info("All cache data flushed");
    } catch (error) {
      logger.error("Error flushing all cache:", error);
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    keys: number;
  }> {
    if (!this.isRedisAvailable || !this.redis) {
      return {
        connected: false,
        memory: null,
        keys: 0,
      };
    }
    try {
      const info = await this.redis.info("memory");
      const keys = await this.redis.dbsize();

      return {
        connected: this.redis.status === "ready",
        memory: this.parseMemoryInfo(info),
        keys,
      };
    } catch (error) {
      logger.error("Error getting cache stats:", error);
      return {
        connected: false,
        memory: null,
        keys: 0,
      };
    }
  }

  private parseMemoryInfo(info: string): any {
    const lines = info.split("\r\n");
    const memory: any = {};

    lines.forEach((line) => {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        if (key.startsWith("used_memory")) {
          memory[key] = value;
        }
      }
    });

    return memory;
  }

  async close(): Promise<void> {
    if (!this.redis) {
      return;
    }
    try {
      await this.redis.quit();
      logger.info("Redis connection closed");
    } catch (error) {
      logger.error("Error closing Redis connection:", error);
    }
  }
}

// Cache key patterns
export const CACHE_KEYS = {
  COURSE: (id: string) => `course:${id}`,
  COURSES_LIST: (page: number, limit: number, filters?: string) =>
    `courses:list:${page}:${limit}:${filters || "all"}`,
  USER: (id: string) => `user:${id}`,
  DASHBOARD: (userId: string, type: string) => `dashboard:${type}:${userId}`,
  ASSIGNMENTS: (courseId: string) => `assignments:${courseId}`,
  LIVE_CLASSES: (courseId: string) => `live_classes:${courseId}`,
  PAYMENTS: (studentId: string) => `payments:${studentId}`,
  ENQUIRIES: (status?: string) => `enquiries:${status || "all"}`,
  SUCCESS_STORIES: (featured?: boolean) =>
    `stories:${featured ? "featured" : "all"}`,
} as const;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
