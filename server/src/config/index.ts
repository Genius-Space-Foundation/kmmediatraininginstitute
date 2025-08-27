import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "5000"),
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration (PostgreSQL)
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    name: process.env.DB_NAME || "kmmedia",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres@localhost:5432/kmmedia",
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  // CORS configuration
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  // Security
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
  },

  // File upload
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
  },
} as const;

export type Config = typeof config;
