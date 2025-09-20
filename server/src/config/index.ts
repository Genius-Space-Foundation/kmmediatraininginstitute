/**
 * Application Configuration
 *
 * This module exports the application configuration for Firebase/Firestore.
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // Database configuration (removed PostgreSQL - now using Firestore)
  // Legacy database config removed - using Firestore instead

  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Bcrypt configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  },

  // Paystack configuration
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || "",
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    baseUrl: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    uploadPath: process.env.UPLOAD_PATH || "./uploads",
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM || "noreply@kmmedia.com",
  },

  // Redis configuration (for caching and sessions)
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // limit each IP to 100 requests per windowMs
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
    sessionSecret: process.env.SESSION_SECRET || "your-session-secret",
    corsEnabled: process.env.CORS_ENABLED !== "false",
  },
};

// Validation function
export const validateConfig = () => {
  const requiredEnvVars = ["JWT_SECRET", "FIREBASE_PROJECT_ID"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    console.error(
      "Please check your .env file and ensure all required variables are set."
    );
    process.exit(1);
  }

  console.log("✅ Configuration validated successfully");
};

export default config;
