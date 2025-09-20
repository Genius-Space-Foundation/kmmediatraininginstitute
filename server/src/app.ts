import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { config } from "./config";
import { logger } from "./utils/logger";
import { AppError, createErrorResponse } from "./utils/errors";
import { requestTiming, errorTracking } from "./middleware/monitoring";
import { initializeFirestore } from "./database/firestore";

// Import v1 routes
import authRoutes from "./routes/v1/auth";
import coursesRoutes from "./routes/v1/courses";
import v1AssignmentsRoutes from "./routes/v1/assignments";
import v1LiveClassesRoutes from "./routes/v1/live-classes";
import v1PaymentsRoutes from "./routes/v1/payments";

// Import legacy routes
import courseMaterialsRoutes from "./routes/courseMaterials";
import healthRoutes from "./routes/health";

// Import legacy routes (to be migrated)
import legacyAuthRoutes from "./routes/auth";
import legacyCoursesRoutes from "./routes/courses";
// import registrationsSimple from "./routes/registrations-simple";
import legacyEnquiryRoutes from "./routes/enquiry";
import studentsFirestoreRoutes from "./routes/students-firestore";
import adminFirestoreRoutes from "./routes/admin-firestore";
// import storiesSimple from "./routes/stories-simple";
// import trainers from "./routes/trainers";
// import paymentRoutes from "./routes/payments";
// import studentRoutes from "./routes/students";
// import courseContentRoutes from "./routes/course-content";
// import adminCourseAccessRoutes from "./routes/admin-course-access";
// import adminRoutes from "./routes/admin";
// import usersRoutes from "./routes/users";
// import sessionsRoutes from "./routes/sessions";
// import assignmentsRoutes from "./routes/assignments";
// import uploadRoutes from "./routes/upload";

// Enhanced Learning Routes
import liveClassesRoutes from "./routes/live-classes";
import catchupSessionsRoutes from "./routes/catchup-sessions";
import learningStatsRoutes from "./routes/learning-stats";
// import capstoneProjectsRoutes from "./routes/capstone-projects";
// import industrialAttachmentsRoutes from "./routes/industrial-attachments";

const app = express();

// Initialize Firestore
try {
  initializeFirestore();
  logger.info("Firestore initialized successfully");
} catch (error) {
  logger.error("Failed to initialize Firestore:", error);
  process.exit(1);
}

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
if (config.server.nodeEnv === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "https:"],
          "style-src": ["'self'", "'unsafe-inline'", "https:"],
          "img-src": ["'self'", "data:", "https:"],
          "connect-src": ["'self'", config.server.corsOrigin],
          "font-src": ["'self'", "https:"],
          "object-src": ["'none'"],
          "frame-ancestors": ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );
} else {
  // Relaxed in development to avoid blocking local assets
  app.use(helmet());
}

// HTTP Parameter Pollution protection
app.use(hpp());

// Response compression
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: config.server.corsOrigin,
    credentials: true,
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100 to 200 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes for auth
  message: {
    success: false,
    message: "Too many authentication requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Apply stricter rate limiting to auth routes
app.use("/api/auth", authLimiter);
app.use("/api/v1/auth", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.request(req.method, req.path);
  next();
});

// Health check routes
app.use("/api/health", healthRoutes);

// API routes - New v1 routes (temporarily disabled due to type issues)
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/courses", coursesRoutes);
// app.use("/api/v1/assignments", v1AssignmentsRoutes);
// app.use("/api/v1/live-classes", v1LiveClassesRoutes);
// app.use("/api/v1/payments", v1PaymentsRoutes);

// Legacy routes (to be deprecated)
app.use("/api/auth", legacyAuthRoutes);
app.use("/api/courses", legacyCoursesRoutes);
app.use("/api/enquiry", legacyEnquiryRoutes);
app.use("/api/students", studentsFirestoreRoutes); // Firestore-based student routes
app.use("/api", adminFirestoreRoutes); // Firestore-based admin routes

// Enhanced Learning Routes
// app.use("/api/live-classes", liveClassesRoutes); // Live classes routes
// app.use("/api/catchup-sessions", catchupSessionsRoutes); // Catchup sessions routes
// app.use("/api/students/learning-stats", learningStatsRoutes); // Learning stats routes
// app.use("/api/capstone-projects", capstoneProjectsRoutes); // Capstone projects routes
// app.use("/api/industrial-attachments", industrialAttachmentsRoutes); // Industrial attachments routes

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
