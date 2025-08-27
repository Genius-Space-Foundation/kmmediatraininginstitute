# Backend Architecture Documentation

## Overview

The backend has been restructured to follow modern Node.js/Express best practices with a clean, scalable architecture. The new structure separates concerns, improves maintainability, and provides better error handling and logging.

## Architecture Layers

### 1. Configuration Layer (`/src/config`)

- **Purpose**: Centralized configuration management
- **Files**: `index.ts`
- **Features**: Environment variables, app settings, security configs

### 2. Database Layer (`/src/database`)

- **Purpose**: Database connection and initialization
- **Files**: `database.ts`
- **Features**: SQLite connection, table initialization

### 3. Repository Layer (`/src/repositories`)

- **Purpose**: Data access abstraction
- **Files**: `BaseRepository.ts`, `UserRepository.ts`
- **Features**: CRUD operations, query building, error handling

### 4. Service Layer (`/src/services`)

- **Purpose**: Business logic implementation
- **Files**: `UserService.ts`, `CourseService.ts`
- **Features**: Domain logic, data transformation, validation

### 5. Controller Layer (`/src/controllers`)

- **Purpose**: Request/response handling
- **Files**: `BaseController.ts`, `AuthController.ts`, `CourseController.ts`
- **Features**: HTTP handling, error management, logging

### 6. Route Layer (`/src/routes`)

- **Purpose**: API endpoint definitions
- **Files**: `/v1/auth.ts`, `/v1/courses.ts`
- **Features**: Route definitions, middleware chaining

### 7. Middleware Layer (`/src/middleware`)

- **Purpose**: Request processing middleware
- **Files**: `auth.ts`
- **Features**: Authentication, authorization, request processing

### 8. Utility Layer (`/src/utils`)

- **Purpose**: Shared utilities and helpers
- **Files**: `logger.ts`, `errors.ts`, `validation.ts`
- **Features**: Logging, error handling, validation

## Key Improvements

### 1. Separation of Concerns

- **Before**: Mixed business logic and database queries in routes
- **After**: Clear separation between layers with specific responsibilities

### 2. Error Handling

- **Before**: Basic try-catch with console.log
- **After**: Custom error classes with proper HTTP status codes and structured logging

### 3. Logging

- **Before**: Console.log statements
- **After**: Structured logging with different levels and metadata

### 4. Validation

- **Before**: Validation scattered across route files
- **After**: Centralized validation with reusable rules

### 5. Configuration

- **Before**: Environment variables scattered throughout code
- **After**: Centralized configuration management

### 6. Database Access

- **Before**: Direct database queries in services
- **After**: Repository pattern with abstraction layer

## API Structure

### New v1 API Endpoints

```
/api/v1/auth
├── POST /register
├── POST /login
├── GET /profile
└── PUT /profile

/api/v1/courses
├── GET /
├── GET /:id
├── POST /
├── PUT /:id
├── DELETE /:id
├── PATCH /:id/toggle
└── GET /trainer/my-courses
```

### Legacy API Endpoints (Deprecated)

```
/api/auth
/api/courses
/api/registrations
/api/enquiry
/api/stories
/api/trainers
```

## Usage Examples

### Creating a New Service

1. **Create Repository** (if needed):

```typescript
// src/repositories/NewEntityRepository.ts
import { BaseRepository } from "./BaseRepository";
import { NewEntity } from "../types";

export class NewEntityRepository extends BaseRepository {
  async findById(id: number): Promise<NewEntity | null> {
    return this.queryOne<NewEntity>("SELECT * FROM new_entities WHERE id = ?", [
      id,
    ]);
  }

  // Add other CRUD methods...
}
```

2. **Create Service**:

```typescript
// src/services/NewEntityService.ts
import { NewEntityRepository } from "../repositories/NewEntityRepository";
import { logger } from "../utils/logger";

export class NewEntityService {
  constructor(private repository: NewEntityRepository) {}

  async getById(id: number): Promise<NewEntity> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError("Entity not found");
    }
    return entity;
  }

  // Add other business logic methods...
}
```

3. **Create Controller**:

```typescript
// src/controllers/NewEntityController.ts
import { BaseController } from "./BaseController";
import { NewEntityService } from "../services/NewEntityService";

export class NewEntityController extends BaseController {
  constructor(private service: NewEntityService) {
    super();
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const id = parseInt(req.params.id);
      return await this.service.getById(id);
    });
  }
}
```

4. **Create Routes**:

```typescript
// src/routes/v1/new-entity.ts
import { Router } from "express";
import { newEntityController } from "../../controllers/NewEntityController";
import {
  createValidationMiddleware,
  commonValidations,
} from "../../utils/validation";

const router = Router();

router.get(
  "/:id",
  createValidationMiddleware([commonValidations.id]),
  newEntityController.getById.bind(newEntityController)
);

export default router;
```

### Error Handling

The new architecture provides consistent error handling:

```typescript
// Custom errors
throw new ValidationError("Invalid input", validationErrors);
throw new AuthenticationError("Invalid credentials");
throw new AuthorizationError("Insufficient permissions");
throw new NotFoundError("Resource not found");
throw new ConflictError("Resource already exists");
throw new DatabaseError("Database operation failed");
```

### Logging

Structured logging with different levels:

```typescript
import { logger } from "../utils/logger";

logger.error("Critical error", {
  userId: 123,
  error: "Database connection failed",
});
logger.warn("Warning message", { data: "Some warning data" });
logger.info("Information message", { action: "User logged in" });
logger.debug("Debug information", { details: "Debug data" });
```

## Migration Strategy

### Phase 1: ✅ Complete

- [x] Create new architecture structure
- [x] Implement configuration management
- [x] Create utility classes (logger, errors, validation)
- [x] Implement base repository and controller classes
- [x] Create UserService and UserRepository
- [x] Create CourseService and CourseRepository
- [x] Implement new v1 routes for auth and courses

### Phase 2: In Progress

- [ ] Migrate remaining services (Registration, Story, Trainer)
- [ ] Create repositories for all entities
- [ ] Implement remaining v1 routes
- [ ] Add comprehensive testing

### Phase 3: Future

- [ ] Deprecate legacy routes
- [ ] Add API documentation
- [ ] Implement caching layer
- [ ] Add monitoring and metrics

## Development Guidelines

### 1. Follow the Layer Pattern

- Controllers handle HTTP concerns
- Services handle business logic
- Repositories handle data access
- Utilities provide shared functionality

### 2. Use Dependency Injection

- Inject dependencies through constructors
- Avoid direct imports in services

### 3. Implement Proper Error Handling

- Use custom error classes
- Provide meaningful error messages
- Log errors with context

### 4. Write Clean Code

- Use TypeScript interfaces
- Follow naming conventions
- Add JSDoc comments for complex methods

### 5. Test Your Code

- Write unit tests for services
- Write integration tests for controllers
- Test error scenarios

## Environment Variables

Required environment variables:

```env
# Server
PORT=9999
NODE_ENV=development

# Database
DATABASE_PATH=./database.sqlite

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=10485760
```

## Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The new architecture provides a solid foundation for scaling the application while maintaining code quality and developer productivity.
