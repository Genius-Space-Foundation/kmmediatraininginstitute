import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./utils/logger";
import { AppError, createErrorResponse } from "./utils/errors";

// Import routes
import authRoutes from "./routes/v1/auth";
import coursesRoutes from "./routes/v1/courses";

// Import legacy routes (to be migrated)
import legacyAuthRoutes from "./routes/auth";
import legacyCoursesRoutes from "./routes/courses";
import registrationsSimple from "./routes/registrations-simple";
import legacyEnquiryRoutes from "./routes/enquiry";
import storiesSimple from "./routes/stories-simple";
import trainers from "./routes/trainers";
import paymentRoutes from "./routes/payments";
import studentRoutes from "./routes/students";
import courseContentRoutes from "./routes/course-content";
import adminCourseAccessRoutes from "./routes/admin-course-access";

const app = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.request(req.method, req.path);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});

// API routes - New v1 routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesRoutes);

// Legacy routes (to be deprecated)
app.use("/api/auth", legacyAuthRoutes);
app.use("/api/courses", legacyCoursesRoutes);
app.use("/api/registrations", registrationsSimple); // PostgreSQL-compatible registrations route
app.use("/api/enquiry", legacyEnquiryRoutes);
app.use("/api/stories", storiesSimple); // Simplified PostgreSQL-compatible stories route
app.use("/api/trainers", trainers); // TODO: Update to PostgreSQL
app.use("/api/payments", paymentRoutes); // Payment routes
app.use("/api/students", studentRoutes); // Student dashboard routes
app.use("/api/courses", courseContentRoutes); // Course content routes
app.use("/api/admin", adminCourseAccessRoutes); // Admin course access routes

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
    });

    if (err instanceof AppError) {
      res.status(err.statusCode).json(createErrorResponse(err));
    } else {
      const internalError = new AppError("Internal server error", 500, false);
      res.status(500).json(createErrorResponse(internalError));
    }
  }
);

export default app;
