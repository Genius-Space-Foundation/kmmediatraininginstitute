# Performance Optimization Guide

## Database Optimizations

### 1. Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_course_registrations_status_payment ON course_registrations(status, payment_status);
CREATE INDEX idx_assignments_course_due_date ON assignments(course_id, due_date);
CREATE INDEX idx_live_classes_course_scheduled ON live_classes(course_id, scheduled_date);

-- Partial indexes for active records
CREATE INDEX idx_courses_active ON courses(id) WHERE is_active = true;
CREATE INDEX idx_assignments_active ON assignments(course_id, due_date) WHERE is_active = true;

-- Text search indexes
CREATE INDEX idx_courses_title_search ON courses USING gin(to_tsvector('english', title));
CREATE INDEX idx_courses_description_search ON courses USING gin(to_tsvector('english', description));
```

### 2. Query Optimization

- Use `EXPLAIN ANALYZE` to identify slow queries
- Implement query result caching
- Use database connection pooling (already configured)
- Optimize N+1 queries with proper joins

### 3. Database Connection Pooling

```typescript
// Already configured in database.ts
export const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections
  connectionTimeoutMillis: 2000, // Connection timeout
});
```

## Caching Strategy

### 1. Redis Implementation

```typescript
// Add to config
redis: {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  ttl: 3600, // 1 hour default TTL
}

// Cache service
export class CacheService {
  private redis: Redis;

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 2. Cache Keys Strategy

```typescript
// Cache key patterns
const CACHE_KEYS = {
  COURSE: (id: string) => `course:${id}`,
  COURSES_LIST: (page: number, limit: number) =>
    `courses:list:${page}:${limit}`,
  USER: (id: string) => `user:${id}`,
  DASHBOARD: (userId: string) => `dashboard:${userId}`,
  ASSIGNMENTS: (courseId: string) => `assignments:${courseId}`,
};
```

### 3. Cache Invalidation

```typescript
// Invalidate related caches when data changes
async updateCourse(id: string, updates: Partial<Course>) {
  const course = await this.courseRepository.update(id, updates);

  // Invalidate related caches
  await this.cacheService.invalidate(`course:${id}`);
  await this.cacheService.invalidate('courses:list:*');
  await this.cacheService.invalidate(`assignments:${id}`);

  return course;
}
```

## API Response Optimization

### 1. Response Compression

```typescript
// Already configured in app.ts
app.use(compression());
```

### 2. Pagination Optimization

```typescript
// Implement cursor-based pagination for large datasets
interface CursorPagination {
  cursor?: string;
  limit: number;
  direction: "next" | "prev";
}

// Use cursor instead of offset for better performance
const getCoursesWithCursor = async (cursor?: string, limit: number = 10) => {
  const query = cursor
    ? `SELECT * FROM courses WHERE id > $1 ORDER BY id LIMIT $2`
    : `SELECT * FROM courses ORDER BY id LIMIT $1`;

  const params = cursor ? [cursor, limit] : [limit];
  return pool.query(query, params);
};
```

### 3. Field Selection

```typescript
// Only select required fields
const getCourseSummary = async (id: string) => {
  const query = `
    SELECT id, title, price, level, category, image_url, is_active
    FROM courses 
    WHERE id = $1
  `;
  return pool.query(query, [id]);
};
```

## Monitoring and Metrics

### 1. Performance Monitoring

```typescript
// Add performance middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
});
```

### 2. Database Query Monitoring

```typescript
// Add query logging
const logQuery = (query: string, params: any[], duration: number) => {
  if (duration > 1000) {
    // Log slow queries
    logger.warn("Slow query detected", {
      query: query.substring(0, 100),
      duration: `${duration}ms`,
      params: params.length,
    });
  }
};
```

### 3. Health Checks

```typescript
// Enhanced health check
app.get("/api/health", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  const isHealthy = Object.values(checks).every((check) =>
    typeof check === "object" ? check.status === "ok" : true
  );

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

## Load Balancing

### 1. Horizontal Scaling

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    replicas: 3
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### 2. Nginx Configuration

```nginx
upstream app_servers {
    server app_1:5000;
    server app_2:5000;
    server app_3:5000;
}

server {
    listen 80;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Security Optimizations

### 1. Rate Limiting

```typescript
// Implement per-user rate limiting
const userRateLimit = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per user per window
});
```

### 2. Input Validation

```typescript
// Use Joi for schema validation
const courseSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).max(2000).required(),
  price: Joi.number().min(0).max(10000).required(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").required(),
});
```

## Deployment Optimizations

### 1. Docker Multi-stage Build

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### 2. Environment-specific Configurations

```typescript
// config/performance.ts
export const performanceConfig = {
  development: {
    cache: false,
    compression: false,
    rateLimit: { windowMs: 60000, max: 1000 },
  },
  production: {
    cache: true,
    compression: true,
    rateLimit: { windowMs: 900000, max: 100 },
  },
};
```

## Performance Testing

### 1. Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/v1/courses"
          headers:
            Authorization: "Bearer {{ token }}"
```

### 2. Database Performance Testing

```sql
-- Test query performance
EXPLAIN ANALYZE
SELECT c.*, u.first_name, u.last_name
FROM courses c
LEFT JOIN users u ON c.trainer_id = u.id
WHERE c.is_active = true
ORDER BY c.created_at DESC
LIMIT 10;
```

## Monitoring Tools

### 1. Application Metrics

- **Response Time**: Track API response times
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Database Connections**: Active connection count

### 2. Infrastructure Metrics

- **CPU Usage**: Server CPU utilization
- **Memory Usage**: RAM consumption
- **Disk I/O**: Database and file operations
- **Network**: Bandwidth usage

### 3. Business Metrics

- **User Registrations**: Daily/weekly/monthly
- **Course Enrollments**: Conversion rates
- **Payment Success**: Transaction success rate
- **Assignment Submissions**: Student engagement

## Best Practices

1. **Database**

   - Use appropriate indexes
   - Implement connection pooling
   - Monitor slow queries
   - Use read replicas for heavy read operations

2. **Caching**

   - Cache frequently accessed data
   - Implement cache invalidation strategies
   - Use Redis for distributed caching
   - Set appropriate TTL values

3. **API Design**

   - Implement pagination for large datasets
   - Use field selection to reduce payload
   - Implement proper HTTP caching headers
   - Use compression for large responses

4. **Monitoring**

   - Set up comprehensive logging
   - Implement health checks
   - Monitor performance metrics
   - Set up alerting for critical issues

5. **Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS in production
   - Implement proper authentication



