import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redis: Redis | null = null;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("error", (err) => {
    console.warn("Redis connection error:", err.message);
    redis = null;
  });
} catch (error) {
  console.warn("Failed to initialize Redis:", error);
  redis = null;
}

export const withCache = <T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
) => {
  return async (): Promise<T> => {
    if (!redis) {
      return await fetcher();
    }

    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached) as T;

      const data = await fetcher();
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      return data;
    } catch (error) {
      console.warn("Cache error, falling back to fetcher:", error);
      return await fetcher();
    }
  };
};

export const invalidate = async (pattern: string) => {
  if (!redis) {
    console.warn("Redis not available, cache invalidation skipped");
    return;
  }

  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const keys: string[] = [];
    for await (const resultKeys of stream) {
      for (const key of resultKeys as string[]) keys.push(key);
    }
    if (keys.length) await redis.del(...keys);
  } catch (error) {
    console.warn("Cache invalidation error:", error);
  }
};
